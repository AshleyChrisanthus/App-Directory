import type { EncryptedVaultEnvelope, SyncConfig } from './types';

export interface CloudLockerAdapter {
  get(vaultId: string): Promise<EncryptedVaultEnvelope | null>;
  put(vaultId: string, envelope: EncryptedVaultEnvelope): Promise<boolean>;
}

// Built-in free serverless relay fallback endpoint
const DEFAULT_RELAY_ENDPOINT = 'https://app-directory-sync.onrender.com';

/**
 * Custom Serverless / Cloudflare Worker Locker
 * Follows REST convention:
 *   GET  <endpoint>/api/vault/:vaultId
 *   PUT  <endpoint>/api/vault/:vaultId
 */
export class CustomWorkerLocker implements CloudLockerAdapter {
  private endpoint: string;
  private authHeader?: string;

  constructor(endpoint: string, authHeader?: string) {
    this.endpoint = endpoint.replace(/\/+$/, '');
    this.authHeader = authHeader;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-App-Client': 'AppDirectory-E2EE-v1'
    };
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader.startsWith('Bearer ')
        ? this.authHeader
        : `Bearer ${this.authHeader}`;
    }
    return headers;
  }

  async get(vaultId: string): Promise<EncryptedVaultEnvelope | null> {
    const url = `${this.endpoint}/api/vault/${encodeURIComponent(vaultId)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error(`Cloud locker returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return data as EncryptedVaultEnvelope;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Cloud sync request timed out (10s)');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async put(vaultId: string, envelope: EncryptedVaultEnvelope): Promise<boolean> {
    const url = `${this.endpoint}/api/vault/${encodeURIComponent(vaultId)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(envelope),
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error(`Cloud locker update failed (HTTP ${res.status}): ${res.statusText}`);
      }
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Cloud sync upload timed out (10s)');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * Supabase Locker Adapter
 * Uses standard PostgREST table:
 * Table schema:
 *   create table sync_vaults (
 *     vault_id text primary key,
 *     envelope jsonb not null,
 *     updated_at timestamptz default now()
 *   );
 */
export class SupabaseLocker implements CloudLockerAdapter {
  private url: string;
  private anonKey: string;

  constructor(supabaseUrl: string, anonKey: string) {
    this.url = supabaseUrl.replace(/\/+$/, '');
    this.anonKey = anonKey;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      apikey: this.anonKey,
      Authorization: `Bearer ${this.anonKey}`,
      Prefer: 'return=representation'
    };
  }

  async get(vaultId: string): Promise<EncryptedVaultEnvelope | null> {
    const endpoint = `${this.url}/rest/v1/sync_vaults?vault_id=eq.${encodeURIComponent(vaultId)}&select=envelope`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!res.ok) {
      throw new Error(`Supabase query failed: HTTP ${res.status}`);
    }

    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && rows[0].envelope) {
      return rows[0].envelope as EncryptedVaultEnvelope;
    }
    return null;
  }

  async put(vaultId: string, envelope: EncryptedVaultEnvelope): Promise<boolean> {
    const endpoint = `${this.url}/rest/v1/sync_vaults`;
    const headers = {
      ...this.getHeaders(),
      Prefer: 'resolution=merge-duplicates'
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        vault_id: vaultId,
        envelope,
        updated_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      throw new Error(`Supabase upsert failed: HTTP ${res.status}`);
    }
    return true;
  }
}

/**
 * Factory to instantiate the appropriate adapter based on config.
 */
export function createLockerAdapter(config: SyncConfig): CloudLockerAdapter {
  if (config.provider === 'custom' && config.customEndpoint) {
    return new CustomWorkerLocker(config.customEndpoint, config.customAuthHeader);
  }

  if (config.provider === 'supabase' && config.supabaseUrl && config.supabaseAnonKey) {
    return new SupabaseLocker(config.supabaseUrl, config.supabaseAnonKey);
  }

  // Default serverless relay
  const endpoint = config.customEndpoint || DEFAULT_RELAY_ENDPOINT;
  return new CustomWorkerLocker(endpoint, config.customAuthHeader);
}
