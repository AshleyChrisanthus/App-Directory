import type { BookmarkEntry, Folder } from '../../types';
import { state } from '../../core/state';
import { loadEntries, loadFolders, saveEntries, saveFolders } from '../../core/storage';
import { showToast } from '../../utils/dom';
import type {
  SyncConfig,
  SyncStatus,
  SyncStatusState,
  SyncTombstone,
  DecryptedSyncPayload
} from './types';
import {
  generateSecretKey,
  generateVaultId,
  encryptPayload,
  decryptPayload,
  bytesToBase64Url,
  base64UrlToBytes
} from './crypto';
import { mergeSyncPayload, pruneTombstones } from './merger';
import { createLockerAdapter, RestfulApiRelayLocker } from './backend';

const CONFIG_STORAGE_KEY = 'appDirectory_sync_config_v1';
const TOMBSTONES_STORAGE_KEY = 'appDirectory_sync_tombstones_v1';
const DEVICE_ID_KEY = 'appDirectory_device_id';

class SyncManager {
  private config: SyncConfig | null = null;
  private status: SyncStatus = {
    state: 'disconnected',
    lastSyncedAt: null
  };
  private statusListeners: Array<(status: SyncStatus) => void> = [];
  private debounceTimer: any = null;
  private isSyncing = false;

  constructor() {
    this.loadConfig();
    this.setupLifecycleListeners();
  }

  // ── Device ID ──────────────────────────────────────────────
  getDeviceId(): string {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  // ── Config Persistence ─────────────────────────────────────
  loadConfig(): SyncConfig | null {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (raw) {
        this.config = JSON.parse(raw);
        if (this.config && this.config.enabled) {
          this.setStatus('synced', this.config.lastSyncedAt ? new Date(this.config.lastSyncedAt) : null);
        } else {
          this.setStatus('disconnected', null);
        }
        return this.config;
      }
    } catch (_) {}
    this.config = null;
    this.setStatus('disconnected', null);
    return null;
  }

  saveConfig(newConfig: SyncConfig | null): void {
    this.config = newConfig;
    if (newConfig) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
      this.setStatus('synced', newConfig.lastSyncedAt ? new Date(newConfig.lastSyncedAt) : null);
    } else {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      this.setStatus('disconnected', null);
    }
  }

  getConfig(): SyncConfig | null {
    return this.config;
  }

  isConfigured(): boolean {
    return !!(this.config && this.config.enabled && this.config.vaultId && this.config.secretKey);
  }

  // ── Status Management ──────────────────────────────────────
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  onStatusChange(fn: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(fn);
    fn(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== fn);
    };
  }

  private setStatus(state: SyncStatusState, lastSyncedAt: Date | null, errorMessage?: string): void {
    this.status = {
      state,
      lastSyncedAt,
      errorMessage,
      itemCount: state === 'synced' ? (this.config ? this.getLocalEntries().length : undefined) : undefined
    };
    for (const listener of this.statusListeners) {
      try {
        listener(this.getStatus());
      } catch (_) {}
    }
  }

  // ── Tombstone Management ───────────────────────────────────
  getLocalTombstones(): SyncTombstone[] {
    try {
      const raw = localStorage.getItem(TOMBSTONES_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          return pruneTombstones(list);
        }
      }
    } catch (_) {}
    return [];
  }

  saveLocalTombstones(tombstones: SyncTombstone[]): void {
    try {
      localStorage.setItem(TOMBSTONES_STORAGE_KEY, JSON.stringify(pruneTombstones(tombstones)));
    } catch (_) {}
  }

  recordDeletion(id: string, type: 'entry' | 'folder'): void {
    const tombstones = this.getLocalTombstones();
    tombstones.push({
      id,
      type,
      deletedAt: new Date().toISOString()
    });
    this.saveLocalTombstones(tombstones);

    if (this.isConfigured()) {
      this.schedulePush();
    }
  }

  // ── Helpers for Local State ────────────────────────────────
  private getLocalEntries(): BookmarkEntry[] {
    return state.entries || loadEntries() || [];
  }

  private getLocalFolders(): Folder[] {
    return state.folders || loadFolders() || [];
  }

  // ── Vault Setup & Pairing ──────────────────────────────────
  async createNewVault(): Promise<SyncConfig> {
    const secretKey = await generateSecretKey();
    const deviceId = this.getDeviceId();
    let vaultId = generateVaultId();

    const localEntries = this.getLocalEntries();
    const localFolders = this.getLocalFolders();
    const localTombstones = this.getLocalTombstones();

    const initialPayload: DecryptedSyncPayload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      deviceId,
      entries: localEntries,
      folders: localFolders,
      tombstones: localTombstones
    };

    const initialEnvelope = await encryptPayload(initialPayload, secretKey, deviceId);

    // If using default relay, create the remote vault object
    try {
      const relay = new RestfulApiRelayLocker();
      const remoteId = await relay.createVault(initialEnvelope);
      if (remoteId) {
        vaultId = remoteId;
      }
    } catch (err: any) {
      console.warn('[Sync] Could not initialize remote relay object, using local vaultId:', err);
    }

    const newConfig: SyncConfig = {
      enabled: true,
      vaultId,
      secretKey,
      provider: 'relay',
      autoSync: true,
      deviceId,
      lastSyncedAt: new Date().toISOString()
    };

    this.saveConfig(newConfig);
    this.setStatus('synced', new Date());

    return newConfig;
  }

  joinVault(vaultId: string, secretKey: string, provider: 'relay' | 'custom' | 'supabase' = 'relay'): SyncConfig {
    const cleanVaultId = vaultId.trim();
    const cleanSecretKey = secretKey.trim();

    if (!cleanVaultId || !cleanSecretKey) {
      throw new Error('Vault ID and Secret Key are required to pair.');
    }

    const newConfig: SyncConfig = {
      enabled: true,
      vaultId: cleanVaultId,
      secretKey: cleanSecretKey,
      provider,
      autoSync: true,
      deviceId: this.getDeviceId()
    };

    this.saveConfig(newConfig);
    return newConfig;
  }

  disconnectVault(): void {
    this.saveConfig(null);
    localStorage.removeItem(TOMBSTONES_STORAGE_KEY);
    showToast('Cloud Sync disconnected');
  }

  getPairingUrl(): string {
    if (!this.config) return '';
    const base = window.location.origin + window.location.pathname;
    // Embed credentials exclusively in URL hash fragment
    const hash = `sync=v1:${this.config.vaultId}:${this.config.secretKey}:${this.config.provider}`;
    return `${base}#${hash}`;
  }

  /**
   * Checks if current page was opened with pairing hash `#sync=v1:vaultId:secretKey:...`
   * Cleans URL hash immediately for privacy.
   */
  checkUrlHashForPairing(): boolean {
    try {
      const hash = window.location.hash;
      if (!hash || !hash.includes('sync=v1:')) return false;

      const match = hash.match(/sync=v1:([^:]+):([^:]+)(?::([^:]+))?/);
      if (match) {
        const vaultId = match[1];
        const secretKey = match[2];
        const provider = (match[3] as any) || 'relay';

        // Scrub hash from URL address bar immediately
        history.replaceState(null, '', window.location.pathname + window.location.search);

        this.joinVault(vaultId, secretKey, provider);
        showToast('Paired with sync vault! Synchronizing…');

        // Immediately trigger sync
        this.syncNow()
          .then(() => {
            showToast('Bookmarks successfully synchronized!');
          })
          .catch((err) => {
            showToast(`Initial sync error: ${err.message}`, 4000);
          });

        return true;
      }
    } catch (_) {}
    return false;
  }

  // ── Sync Engine (Bi-Directional E2EE) ───────────────────────
  async syncNow(): Promise<void> {
    if (!this.isConfigured() || !this.config) return;
    if (this.isSyncing) return;

    if (!navigator.onLine) {
      this.setStatus('offline', this.config.lastSyncedAt ? new Date(this.config.lastSyncedAt) : null);
      return;
    }

    this.isSyncing = true;
    this.setStatus('syncing', this.config.lastSyncedAt ? new Date(this.config.lastSyncedAt) : null);

    try {
      const adapter = createLockerAdapter(this.config);
      const remoteEnvelope = await adapter.get(this.config.vaultId);

      let remotePayload: DecryptedSyncPayload | null = null;
      if (remoteEnvelope) {
        try {
          remotePayload = await decryptPayload(remoteEnvelope, this.config.secretKey);
        } catch (decryptErr: any) {
          throw new Error(`Decryption failed: Incorrect secret key or corrupted data. (${decryptErr.message})`);
        }
      }

      const localEntries = this.getLocalEntries();
      const localFolders = this.getLocalFolders();
      const localTombstones = this.getLocalTombstones();

      let mergedEntries = localEntries;
      let mergedFolders = localFolders;
      let mergedTombstones = localTombstones;

      if (remotePayload) {
        const mergeResult = mergeSyncPayload(
          localEntries,
          localFolders,
          localTombstones,
          remotePayload
        );
        mergedEntries = mergeResult.mergedEntries;
        mergedFolders = mergeResult.mergedFolders;
        mergedTombstones = mergeResult.mergedTombstones;

        if (mergeResult.hasChanges) {
          // Update local storage
          await saveEntries(mergedEntries);
          await saveFolders(mergedFolders);
          this.saveLocalTombstones(mergedTombstones);

          // Signal app to refresh views
          if (typeof (window as any).refreshAppDirectoryViews === 'function') {
            (window as any).refreshAppDirectoryViews();
          }
        }
      }

      // Encrypt and push merged state back to cloud
      const newPayload: DecryptedSyncPayload = {
        version: 1,
        updatedAt: new Date().toISOString(),
        deviceId: this.config.deviceId,
        entries: mergedEntries,
        folders: mergedFolders,
        tombstones: mergedTombstones
      };

      const encryptedEnvelope = await encryptPayload(
        newPayload,
        this.config.secretKey,
        this.config.deviceId
      );

      await adapter.put(this.config.vaultId, encryptedEnvelope);

      const now = new Date();
      this.config.lastSyncedAt = now.toISOString();
      this.saveConfig(this.config);
      this.setStatus('synced', now);
    } catch (err: any) {
      console.warn('[Sync] Sync failed:', err);
      this.setStatus(
        'error',
        this.config.lastSyncedAt ? new Date(this.config.lastSyncedAt) : null,
        err.message || 'Sync error'
      );
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }

  schedulePush(): void {
    if (!this.isConfigured()) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.syncNow().catch((err) => {
        console.warn('[Sync] Scheduled push failed:', err);
      });
    }, 1500);
  }

  private setupLifecycleListeners(): void {
    window.addEventListener('online', () => {
      if (this.isConfigured()) {
        this.syncNow().catch(() => {});
      }
    });

    window.addEventListener('offline', () => {
      if (this.isConfigured()) {
        this.setStatus('offline', this.config?.lastSyncedAt ? new Date(this.config.lastSyncedAt) : null);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isConfigured()) {
        this.syncNow().catch(() => {});
      }
    });
  }
}

export const syncManager = new SyncManager();
