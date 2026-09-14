import { syncManager } from './sync-manager';
import { generateQrSvg } from './qr';
import { QrCameraScanner } from './scanner';
import { showToast } from '../../utils/dom';

let modalEl: HTMLElement | null = null;
let scanner: QrCameraScanner | null = null;

export function openSyncModal(): void {
  let existing = document.getElementById('syncModal');
  if (existing) {
    existing.remove();
  }

  modalEl = document.createElement('div');
  modalEl.id = 'syncModal';
  modalEl.className = 'modal-backdrop sync-modal-backdrop';

  renderSyncModalContent();
  document.body.appendChild(modalEl);

  requestAnimationFrame(() => {
    if (modalEl) modalEl.classList.add('visible');
  });

  // Listen for sync status changes while modal is open
  const unsubscribe = syncManager.onStatusChange(() => {
    if (modalEl && modalEl.classList.contains('visible')) {
      renderSyncModalContent();
    }
  });

  // Cleanup on close
  (modalEl as any).__cleanup = () => {
    unsubscribe();
    if (scanner) {
      scanner.stop();
      scanner = null;
    }
  };
}

export function closeSyncModal(): void {
  if (!modalEl) return;
  if ((modalEl as any).__cleanup) {
    (modalEl as any).__cleanup();
  }
  modalEl.classList.remove('visible');
  setTimeout(() => {
    if (modalEl) {
      modalEl.remove();
      modalEl = null;
    }
  }, 200);
}

function renderSyncModalContent(): void {
  if (!modalEl) return;

  const isConfigured = syncManager.isConfigured();
  const config = syncManager.getConfig();
  const status = syncManager.getStatus();

  let bodyHtml = '';

  if (!isConfigured) {
    // ── Setup View (Create or Join) ──────────────────────────
    bodyHtml = `
      <div class="sync-intro-banner">
        <div class="sync-intro-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
            <path d="m9 13 2 2 4-4"/>
          </svg>
        </div>
        <div class="sync-intro-text">
          <h3>Zero-Knowledge Cloud Sync</h3>
          <p>Seamlessly synchronize bookmarks, folders, and tags between your desktop and mobile devices. All data is encrypted client-side with <strong>AES-GCM (256-bit)</strong> before leaving your browser.</p>
        </div>
      </div>

      <div class="sync-actions-grid" id="syncSetupChoices">
        <div class="sync-choice-card" id="btnCreateNewVault">
          <div class="sync-choice-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <h4>Create New Vault</h4>
          <p>Generate a new private encryption vault and get a QR code to pair your phone in 1 second.</p>
          <button type="button" class="btn btn-primary" style="margin-top: 10px; width: 100%;">Create Vault</button>
        </div>

        <div class="sync-choice-card" id="btnJoinExistingVault">
          <div class="sync-choice-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <h4>Join Existing Vault</h4>
          <p>Already created a vault on your other device? Scan a QR code or paste your secret key.</p>
          <button type="button" class="btn btn-secondary" style="margin-top: 10px; width: 100%;">Pair Device</button>
        </div>
      </div>

      <div class="sync-join-form" id="syncJoinForm" style="display: none;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h4 style="margin: 0; font-size: 15px;">Enter Vault Credentials</h4>
          <button type="button" class="btn btn-ghost btn-sm" id="btnBackToChoices">← Back</button>
        </div>

        <div class="sync-form-group">
          <label class="sync-label">Pairing Link or Key</label>
          <textarea id="syncPairingInput" class="sync-input" rows="2" placeholder="Paste pairing link or secret key..."></textarea>
        </div>

        <div id="syncScannerContainer" style="display: none; margin-bottom: 12px;">
          <video id="syncCameraVideo" style="width: 100%; border-radius: 8px; background: #000; max-height: 220px;"></video>
          <div style="font-size: 11px; text-align: center; color: var(--text-muted); margin-top: 4px;">Point camera at the QR code on your desktop</div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button type="button" class="btn btn-secondary" id="btnStartCamera" style="flex: 1;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Scan QR
          </button>
          <button type="button" class="btn btn-primary" id="btnSubmitJoin" style="flex: 1.5;">Join Vault</button>
        </div>
      </div>
    `;
  } else {
    // ── Active Vault View ────────────────────────────────────
    const pairingUrl = syncManager.getPairingUrl();
    const qrSvg = generateQrSvg(pairingUrl, { padding: 2 });
    const lastSyncStr = status.lastSyncedAt
      ? status.lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Never';

    let statusPill = `<span class="sync-badge sync-badge-synced">● Synced</span>`;
    if (status.state === 'syncing') {
      statusPill = `<span class="sync-badge sync-badge-syncing">↻ Syncing…</span>`;
    } else if (status.state === 'offline') {
      statusPill = `<span class="sync-badge sync-badge-offline">○ Offline</span>`;
    } else if (status.state === 'error') {
      statusPill = `<span class="sync-badge sync-badge-error" title="${status.errorMessage || ''}">⚠ Error</span>`;
    }

    bodyHtml = `
      <div class="sync-status-card">
        <div class="sync-status-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="margin: 0; font-size: 15px;">Encrypted Sync Active</h4>
              ${statusPill}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Last synced: ${lastSyncStr} &bull; Provider: ${config?.provider || 'relay'}
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btnManualSync" ${status.state === 'syncing' ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="${status.state === 'syncing' ? 'spin' : ''}"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Sync Now
          </button>
        </div>
      </div>

      <div class="sync-pair-section">
        <h5 style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted);">Pair Mobile Device</h5>
        <p style="font-size: 12px; color: var(--text-secondary); margin: 0 0 12px 0;">Open your phone's camera and scan this code to link devices instantly:</p>

        <div class="sync-qr-wrapper">
          <div class="sync-qr-code">${qrSvg}</div>
        </div>

        <div class="sync-form-group" style="margin-top: 14px;">
          <label class="sync-label">Pairing URL (Fragment contains secret key):</label>
          <div style="display: flex; gap: 6px;">
            <input type="text" class="sync-input" id="syncPairingUrlInput" value="${pairingUrl}" readonly />
            <button type="button" class="btn btn-secondary btn-sm" id="btnCopyPairingUrl" title="Copy pairing URL">Copy</button>
          </div>
        </div>

        <div class="sync-form-group" style="margin-top: 10px;">
          <label class="sync-label">Vault ID:</label>
          <input type="text" class="sync-input" value="${config?.vaultId || ''}" readonly style="font-family: monospace; font-size: 11px;" />
        </div>
      </div>

      <div class="sync-danger-section" style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">Disconnect Sync</div>
          <div style="font-size: 11px; color: var(--text-muted);">Stop syncing on this device (local bookmarks remain intact).</div>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" id="btnDisconnectVault" style="color: #ef4444;">Disconnect</button>
      </div>
    `;
  }

  modalEl.innerHTML = `
    <div class="modal-card sync-modal-card">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
            <path d="m9 13 2 2 4-4"/>
          </svg>
          <h2 class="modal-title">Cloud Sync (E2EE)</h2>
        </div>
        <button type="button" class="modal-close-btn" id="syncModalCloseBtn">✕</button>
      </div>
      <div class="modal-body sync-modal-body">
        ${bodyHtml}
      </div>
    </div>
  `;

  attachSyncModalEvents();
}

function attachSyncModalEvents(): void {
  if (!modalEl) return;

  const closeBtn = modalEl.querySelector('#syncModalCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeSyncModal);

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeSyncModal();
  });

  // Setup view events
  const btnCreate = modalEl.querySelector('#btnCreateNewVault');
  if (btnCreate) {
    btnCreate.addEventListener('click', async () => {
      try {
        btnCreate.classList.add('loading');
        await syncManager.createNewVault();
        showToast('Sync vault created and paired!');
        renderSyncModalContent();
      } catch (err: any) {
        showToast(`Error creating vault: ${err.message}`, 4000);
      }
    });
  }

  const btnJoinChoice = modalEl.querySelector('#btnJoinExistingVault');
  const setupChoices = modalEl.querySelector('#syncSetupChoices') as HTMLElement | null;
  const joinForm = modalEl.querySelector('#syncJoinForm') as HTMLElement | null;
  const btnBack = modalEl.querySelector('#btnBackToChoices');

  if (btnJoinChoice && setupChoices && joinForm) {
    btnJoinChoice.addEventListener('click', () => {
      setupChoices.style.display = 'none';
      joinForm.style.display = 'block';
    });
  }

  if (btnBack && setupChoices && joinForm) {
    btnBack.addEventListener('click', () => {
      joinForm.style.display = 'none';
      setupChoices.style.display = 'grid';
      if (scanner) {
        scanner.stop();
        scanner = null;
      }
    });
  }

  // Camera scan button
  const btnStartCamera = modalEl.querySelector('#btnStartCamera');
  const scannerContainer = modalEl.querySelector('#syncScannerContainer') as HTMLElement | null;
  const cameraVideo = modalEl.querySelector('#syncCameraVideo') as HTMLVideoElement | null;
  const pairingInput = modalEl.querySelector('#syncPairingInput') as HTMLTextAreaElement | null;

  if (btnStartCamera && cameraVideo && scannerContainer) {
    btnStartCamera.addEventListener('click', async () => {
      if (!QrCameraScanner.isSupported()) {
        showToast('Camera scanner is not supported on this browser. Please paste the pairing link.');
        return;
      }
      scannerContainer.style.display = 'block';
      scanner = new QrCameraScanner();
      await scanner.start(cameraVideo, {
        onDetected: (scannedText) => {
          if (pairingInput) {
            pairingInput.value = scannedText;
          }
          scannerContainer.style.display = 'none';
          showToast('QR Code scanned successfully!');
        },
        onError: (err) => {
          showToast(`Camera error: ${err}`);
          scannerContainer.style.display = 'none';
        }
      });
    });
  }

  // Submit Join
  const btnSubmitJoin = modalEl.querySelector('#btnSubmitJoin');
  if (btnSubmitJoin && pairingInput) {
    btnSubmitJoin.addEventListener('click', async () => {
      const raw = pairingInput.value.trim();
      if (!raw) {
        showToast('Please enter a pairing link or secret key.');
        return;
      }

      let vaultId = '';
      let secretKey = '';
      let provider: any = 'relay';

      if (raw.includes('sync=v1:')) {
        const match = raw.match(/sync=v1:([^:]+):([^:]+)(?::([^:]+))?/);
        if (match) {
          vaultId = match[1];
          secretKey = match[2];
          if (match[3]) provider = match[3];
        }
      } else if (raw.includes(':')) {
        const parts = raw.split(':');
        vaultId = parts[0];
        secretKey = parts[1];
      }

      if (!vaultId || !secretKey) {
        showToast('Invalid pairing format. Expected link or vaultId:secretKey.');
        return;
      }

      try {
        syncManager.joinVault(vaultId, secretKey, provider);
        showToast('Connected to vault! Syncing…');
        renderSyncModalContent();
        await syncManager.syncNow();
        showToast('Bookmarks synchronized!');
        renderSyncModalContent();
      } catch (err: any) {
        showToast(`Failed to pair: ${err.message}`, 4000);
      }
    });
  }

  // Active view events
  const btnManualSync = modalEl.querySelector('#btnManualSync');
  if (btnManualSync) {
    btnManualSync.addEventListener('click', async () => {
      try {
        await syncManager.syncNow();
        showToast('Bookmarks synchronized!');
      } catch (err: any) {
        showToast(`Sync failed: ${err.message}`, 4000);
      }
    });
  }

  const btnCopyPairingUrl = modalEl.querySelector('#btnCopyPairingUrl');
  const pairingUrlInput = modalEl.querySelector('#syncPairingUrlInput') as HTMLInputElement | null;
  if (btnCopyPairingUrl && pairingUrlInput) {
    btnCopyPairingUrl.addEventListener('click', () => {
      navigator.clipboard.writeText(pairingUrlInput.value).then(() => {
        showToast('Pairing link copied to clipboard!');
      });
    });
  }

  const btnDisconnect = modalEl.querySelector('#btnDisconnectVault');
  if (btnDisconnect) {
    btnDisconnect.addEventListener('click', () => {
      if (confirm('Disconnect from Cloud Sync? Your local bookmarks will remain on this device.')) {
        syncManager.disconnectVault();
        renderSyncModalContent();
      }
    });
  }
}
