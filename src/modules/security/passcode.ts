import { showToast } from '../../utils/dom';

const SECURITY_STORAGE_KEY = 'appDirectory_security';
const SESSION_UNLOCKED_KEY = 'appDirectory_session_unlocked';
const REMEMBER_TOKEN_KEY = 'appDirectory_remember_token';

export interface SecurityConfig {
  enabled: boolean;
  salt: string;
  hash: string;
  rememberToken?: string;
}

// Convert string / ArrayBuffer to hex
function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate random hex string
function generateRandomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return bufToHex(arr.buffer);
}

// Hash passcode with salt using SHA-256 via Web Crypto
export async function hashPasscode(passcode: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(passcode + ':' + salt);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return bufToHex(hashBuf);
  }
  let hash = 0;
  const str = passcode + ':' + salt;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

export function getSecurityConfig(): SecurityConfig | null {
  try {
    const raw = localStorage.getItem(SECURITY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function isPasscodeEnabled(): boolean {
  const cfg = getSecurityConfig();
  return !!(cfg && cfg.enabled && cfg.hash && cfg.salt);
}

export function isAppUnlocked(): boolean {
  if (!isPasscodeEnabled()) return true;

  // 1. Check session storage (active browser session)
  try {
    if (sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true') {
      return true;
    }
  } catch (_) {}

  // 2. Check remembered device token
  try {
    const cfg = getSecurityConfig();
    const token = localStorage.getItem(REMEMBER_TOKEN_KEY);
    if (cfg && cfg.rememberToken && token && cfg.rememberToken === token) {
      return true;
    }
  } catch (_) {}

  return false;
}

export async function setupPasscode(passcode: string, rememberDevice = true): Promise<void> {
  const salt = generateRandomHex(16);
  const hash = await hashPasscode(passcode, salt);
  const rememberToken = rememberDevice ? generateRandomHex(24) : undefined;

  const cfg: SecurityConfig = {
    enabled: true,
    salt,
    hash,
    rememberToken
  };

  localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(cfg));
  sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
  if (rememberToken) {
    localStorage.setItem(REMEMBER_TOKEN_KEY, rememberToken);
  } else {
    localStorage.removeItem(REMEMBER_TOKEN_KEY);
  }
}

export async function verifyPasscode(passcode: string): Promise<boolean> {
  const cfg = getSecurityConfig();
  if (!cfg || !cfg.enabled) return true;
  const testHash = await hashPasscode(passcode, cfg.salt);
  return testHash === cfg.hash;
}

export async function unlockWithPasscode(passcode: string, rememberDevice = false): Promise<boolean> {
  const isValid = await verifyPasscode(passcode);
  if (!isValid) return false;

  const cfg = getSecurityConfig();
  if (cfg) {
    sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
    if (rememberDevice) {
      const token = cfg.rememberToken || generateRandomHex(24);
      cfg.rememberToken = token;
      localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(cfg));
      localStorage.setItem(REMEMBER_TOKEN_KEY, token);
    }
  }
  return true;
}

export function lockApp(): void {
  try {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
    localStorage.removeItem(REMEMBER_TOKEN_KEY);
  } catch (_) {}
}

export function disablePasscode(): void {
  try {
    localStorage.removeItem(SECURITY_STORAGE_KEY);
    localStorage.removeItem(REMEMBER_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
  } catch (_) {}
}

// ── UI Controller ──────────────────────────────────────────

let unlockedCallback: (() => void) | null = null;
let lockedCallback: (() => void) | null = null;

export function showLockScreen(): void {
  const overlay = document.getElementById('appLockOverlay');
  const input = document.getElementById('lockPasscodeInput') as HTMLInputElement | null;
  const errorMsg = document.getElementById('lockErrorMsg');

  if (overlay) {
    overlay.style.display = 'flex';
    document.body.classList.add('app-is-locked');
  }
  if (errorMsg) {
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
  }
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 100);
  }
  if (lockedCallback) {
    lockedCallback();
  }
}

export function hideLockScreen(): void {
  const overlay = document.getElementById('appLockOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    document.body.classList.remove('app-is-locked');
  }
  if (unlockedCallback) {
    unlockedCallback();
  }
}

export function openSecurityModal(): void {
  const modal = document.getElementById('securityModalBackdrop');
  const statusBox = document.getElementById('securityCurrentStatus');
  const currentGroup = document.getElementById('currentPasscodeGroup');
  const currentInput = document.getElementById('currentPasscodeInput') as HTMLInputElement | null;
  const newInput = document.getElementById('newPasscodeInput') as HTMLInputElement | null;
  const confirmInput = document.getElementById('confirmPasscodeInput') as HTMLInputElement | null;
  const disableBtn = document.getElementById('disablePasscodeBtn');
  const errorEl = document.getElementById('securityModalError');

  if (!modal) return;

  const enabled = isPasscodeEnabled();

  if (statusBox) {
    if (enabled) {
      statusBox.innerHTML = '<span class="status-badge active">🔒 Master Passcode Active</span><p class="status-desc">Your app is protected. You can change or remove your passcode below.</p>';
    } else {
      statusBox.innerHTML = '<span class="status-badge inactive">🔓 No Passcode Configured</span><p class="status-desc">Anyone who accesses this URL can view your bookmarks. Set a master passcode to restrict access.</p>';
    }
  }

  if (currentGroup) {
    currentGroup.style.display = enabled ? 'block' : 'none';
  }
  if (disableBtn) {
    disableBtn.style.display = enabled ? 'inline-block' : 'none';
  }
  if (currentInput) currentInput.value = '';
  if (newInput) newInput.value = '';
  if (confirmInput) confirmInput.value = '';
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (enabled && currentInput) {
    setTimeout(() => currentInput.focus(), 100);
  } else if (newInput) {
    setTimeout(() => newInput.focus(), 100);
  }
}

export function closeSecurityModal(): void {
  const modal = document.getElementById('securityModalBackdrop');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export async function syncServerSecurityConfig(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.location.protocol === 'file:') return;

  try {
    const res = await fetch('./security-config.json?v=' + Date.now());
    if (res.ok) {
      const serverCfg = await res.json();
      if (serverCfg && serverCfg.enabled && serverCfg.salt && serverCfg.hash) {
        const localCfg = getSecurityConfig();
        if (!localCfg || localCfg.hash !== serverCfg.hash || localCfg.salt !== serverCfg.salt || !localCfg.enabled) {
          const updated: SecurityConfig = {
            enabled: true,
            salt: serverCfg.salt,
            hash: serverCfg.hash,
            rememberToken: (localCfg && localCfg.hash === serverCfg.hash) ? localCfg.rememberToken : undefined
          };
          localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(updated));
          if (!updated.rememberToken) {
            localStorage.removeItem(REMEMBER_TOKEN_KEY);
            sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
          }
        }
      }
    }
  } catch (_) {}
}

export async function initPasscodeProtection(options: {
  onUnlocked: () => void;
  onLocked: () => void;
}): Promise<void> {
  unlockedCallback = options.onUnlocked;
  lockedCallback = options.onLocked;

  await syncServerSecurityConfig();

  // Header Security / Lock Button
  const securityBtn = document.getElementById('securityLockBtn');
  if (securityBtn) {
    securityBtn.addEventListener('click', () => {
      if (isPasscodeEnabled()) {
        // If already unlocked, open security modal or lock option
        openSecurityModal();
      } else {
        openSecurityModal();
      }
    });
  }

  // Lock Overlay Form
  const form = document.getElementById('lockPasscodeForm');
  const passInput = document.getElementById('lockPasscodeInput') as HTMLInputElement | null;
  const rememberCheckbox = document.getElementById('lockRememberDeviceCheckbox') as HTMLInputElement | null;
  const errorMsg = document.getElementById('lockErrorMsg');
  const toggleVisibilityBtn = document.getElementById('lockToggleVisibilityBtn');

  if (toggleVisibilityBtn && passInput) {
    toggleVisibilityBtn.addEventListener('click', () => {
      const isPassword = passInput.type === 'password';
      passInput.type = isPassword ? 'text' : 'password';
      toggleVisibilityBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  if (form && passInput) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = passInput.value.trim();
      if (!val) return;

      const remember = rememberCheckbox ? rememberCheckbox.checked : true;
      const success = await unlockWithPasscode(val, remember);

      if (success) {
        hideLockScreen();
        showToast('App Directory unlocked');
      } else {
        if (errorMsg) {
          errorMsg.textContent = 'Incorrect passcode. Please try again.';
          errorMsg.style.display = 'block';
        }
        const card = document.querySelector('.lock-card');
        if (card) {
          card.classList.remove('shake');
          void (card as HTMLElement).offsetWidth; // force reflow
          card.classList.add('shake');
        }
        passInput.select();
      }
    });
  }

  // Security Modal Actions
  const modalCloseBtn = document.getElementById('securityModalCloseBtn');
  const modalCancelBtn = document.getElementById('securityModalCancelBtn');
  const saveBtn = document.getElementById('savePasscodeBtn');
  const disableBtn = document.getElementById('disablePasscodeBtn');
  const modalBackdrop = document.getElementById('securityModalBackdrop');

  const modalLockNowBtn = document.getElementById('modalLockNowBtn');
  if (modalLockNowBtn) {
    modalLockNowBtn.addEventListener('click', () => {
      closeSecurityModal();
      lockApp();
      showLockScreen();
      showToast('App Directory locked');
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSecurityModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeSecurityModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeSecurityModal();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const currentInput = document.getElementById('currentPasscodeInput') as HTMLInputElement | null;
      const newInput = document.getElementById('newPasscodeInput') as HTMLInputElement | null;
      const confirmInput = document.getElementById('confirmPasscodeInput') as HTMLInputElement | null;
      const errorEl = document.getElementById('securityModalError');

      const showError = (msg: string) => {
        if (errorEl) {
          errorEl.textContent = msg;
          errorEl.style.display = 'block';
        }
      };

      if (isPasscodeEnabled() && currentInput) {
        const isValid = await verifyPasscode(currentInput.value);
        if (!isValid) {
          showError('Current passcode is incorrect.');
          currentInput.focus();
          return;
        }
      }

      const newPass = newInput ? newInput.value : '';
      const confirmPass = confirmInput ? confirmInput.value : '';

      if (!newPass || newPass.length < 4) {
        showError('Passcode must be at least 4 characters.');
        if (newInput) newInput.focus();
        return;
      }

      if (newPass !== confirmPass) {
        showError('New passcodes do not match.');
        if (confirmInput) confirmInput.focus();
        return;
      }

      await setupPasscode(newPass, true);
      closeSecurityModal();
      showToast('Master Passcode successfully updated');
    });
  }

  if (disableBtn) {
    disableBtn.addEventListener('click', async () => {
      const currentInput = document.getElementById('currentPasscodeInput') as HTMLInputElement | null;
      const errorEl = document.getElementById('securityModalError');

      if (currentInput) {
        const isValid = await verifyPasscode(currentInput.value);
        if (!isValid) {
          if (errorEl) {
            errorEl.textContent = 'Enter your current passcode to remove protection.';
            errorEl.style.display = 'block';
          }
          currentInput.focus();
          return;
        }
      }

      if (confirm('Are you sure you want to disable passcode protection? Anyone with the link will be able to access the app.')) {
        disablePasscode();
        closeSecurityModal();
        showToast('Passcode protection removed');
      }
    });
  }

  // Initial check on load
  if (isPasscodeEnabled() && !isAppUnlocked()) {
    showLockScreen();
  } else {
    hideLockScreen();
  }
}
