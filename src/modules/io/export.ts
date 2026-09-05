import { state } from '../../core/state';
import { getLatestStoredEntries } from '../../core/storage';
import { showToast } from '../../utils/dom';

const IDB_DB_NAME = 'app_directory_db';
const IDB_STORE_NAME = 'handles';
const IDB_KEY_EXPORTS = 'exports_dir_handle';

function openHandlesDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getStoredExportsDirHandle(): Promise<any> {
  try {
    const db = await openHandlesDB();
    return new Promise(resolve => {
      const tx = db.transaction(IDB_STORE_NAME, 'readonly');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.get(IDB_KEY_EXPORTS);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveExportsDirHandle(handle: any): Promise<boolean> {
  try {
    const db = await openHandlesDB();
    return new Promise(resolve => {
      const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.put(handle, IDB_KEY_EXPORTS);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export function getBackupTimestampString(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  const secs = pad(d.getSeconds());
  return `${year}-${month}-${day}_${hours}-${mins}-${secs}`;
}

export function getExportJson(): { json: string; baseName: string; filename: string } | null {
  const list = getLatestStoredEntries();
  if (list.length === 0 && state.folders.length === 0) {
    showToast('Nothing to export.');
    return null;
  }
  const timestamp = getBackupTimestampString();
  const exportObject = {
    version: 2,
    folders: state.folders,
    entries: list
  };
  return {
    json: JSON.stringify(exportObject, null, 2),
    baseName: `app-directory-backup-${timestamp}`,
    filename: `app-directory-backup-${timestamp}.json`
  };
}

async function getUniqueFileHandleInDir(dirHandle: any, baseName: string, ext = '.json'): Promise<any> {
  let candidateName = `${baseName}${ext}`;
  let counter = 1;

  while (true) {
    try {
      await dirHandle.getFileHandle(candidateName, { create: false });
      candidateName = `${baseName} (${counter})${ext}`;
      counter++;
    } catch {
      return await dirHandle.getFileHandle(candidateName, { create: true });
    }
  }
}

export async function exportToFolderDirect(changeFolder = false): Promise<void> {
  const data = getExportJson();
  if (!data) return;

  if ('showDirectoryPicker' in window) {
    try {
      let dirHandle = changeFolder ? null : await getStoredExportsDirHandle();

      if (dirHandle) {
        let perm = await dirHandle.queryPermission({ mode: 'readwrite' });
        if (perm !== 'granted') {
          perm = await dirHandle.requestPermission({ mode: 'readwrite' });
        }
        if (perm !== 'granted') {
          dirHandle = null;
        }
      }

      if (!dirHandle) {
        showToast('Select your "exports" folder to save directly.');
        dirHandle = await (window as any).showDirectoryPicker({
          id: 'app-directory-exports',
          mode: 'readwrite'
        });
        if (dirHandle) {
          await saveExportsDirHandle(dirHandle);
        }
      }

      if (dirHandle) {
        const fileHandle = await getUniqueFileHandleInDir(dirHandle, data.baseName, '.json');
        const writable = await fileHandle.createWritable();
        await writable.write(data.json);
        await writable.close();
        showToast(`Saved directly to ${dirHandle.name}/${fileHandle.name}!`);
        return;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
    }
  }

  exportSaveAs();
}

export function exportQuickDownload(): void {
  const data = getExportJson();
  if (!data) return;
  const blob = new Blob([data.json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = data.filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported backup to Downloads!');
}

export async function exportSaveAs(): Promise<void> {
  const data = getExportJson();
  if (!data) return;

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: data.filename,
        types: [
          {
            description: 'JSON Backup File',
            accept: { 'application/json': ['.json'] }
          }
        ]
      });
      const writable = await handle.createWritable();
      await writable.write(data.json);
      await writable.close();
      showToast('Saved backup successfully!');
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
    }
  }

  exportQuickDownload();
}

export async function exportToClipboard(): Promise<void> {
  const data = getExportJson();
  if (!data) return;
  try {
    await navigator.clipboard.writeText(data.json);
    showToast('Directory JSON copied to clipboard!');
  } catch {
    showToast('Failed to copy to clipboard.');
  }
}

export function exportData(): void {
  exportToFolderDirect(false);
}
