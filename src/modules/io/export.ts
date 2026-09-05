import { state } from '../../core/state';
import { getLatestStoredEntries } from '../../core/storage';
import { showToast } from '../../utils/dom';
import { idbGetHandle, idbSaveHandle } from '../../core/idb';

const IDB_KEY_EXPORTS = 'exports_dir_handle';

async function getStoredExportsDirHandle(): Promise<any> {
  return await idbGetHandle(IDB_KEY_EXPORTS);
}

async function saveExportsDirHandle(handle: any): Promise<boolean> {
  return await idbSaveHandle(IDB_KEY_EXPORTS, handle);
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
  const rawList = getLatestStoredEntries();
  if (rawList.length === 0 && state.folders.length === 0) {
    showToast('Nothing to export.');
    return null;
  }
  const cleanList = rawList.map(e => {
    const copy = { ...e };
    if (copy.iconUrl || copy.icon) {
      copy.iconUrl = copy.iconUrl || copy.icon;
      if (copy.icon && (copy.icon === copy.iconUrl || !copy.customIcon)) {
        delete copy.icon;
      }
    }
    return copy;
  });
  const timestamp = getBackupTimestampString();
  const exportObject = {
    version: 2,
    folders: state.folders,
    entries: cleanList
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
