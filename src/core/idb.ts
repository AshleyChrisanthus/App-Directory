import type { BookmarkEntry, Folder } from '../types';

export const IDB_DB_NAME = 'app_directory_db';
export const IDB_VERSION = 2;

export const STORE_ENTRIES = 'entries';
export const STORE_FOLDERS = 'folders';
export const STORE_HANDLES = 'handles';

let dbInstance: IDBDatabase | null = null;
let dbOpeningPromise: Promise<IDBDatabase> | null = null;

export function openAppDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (dbOpeningPromise) {
    return dbOpeningPromise;
  }

  dbOpeningPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const req = indexedDB.open(IDB_DB_NAME, IDB_VERSION);

    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;

      // 1. Handles store (existing from v1)
      if (!db.objectStoreNames.contains(STORE_HANDLES)) {
        db.createObjectStore(STORE_HANDLES);
      }

      // 2. Entries store (keyPath: id)
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        db.createObjectStore(STORE_ENTRIES, { keyPath: 'id' });
      }

      // 3. Folders store (keyPath: id)
      if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
        db.createObjectStore(STORE_FOLDERS, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => {
      dbInstance = req.result;
      dbOpeningPromise = null;

      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    req.onerror = () => {
      dbOpeningPromise = null;
      reject(req.error);
    };

    req.onblocked = () => {
      console.warn('[IndexedDB] Database upgrade blocked by another tab');
    };
  });

  return dbOpeningPromise;
}

// ── Entries Operations ──────────────────────────────────────────

export async function idbGetAllEntries(): Promise<BookmarkEntry[]> {
  const db = await openAppDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ENTRIES, 'readonly');
    const store = tx.objectStore(STORE_ENTRIES);
    const req = store.getAll();

    req.onsuccess = () => resolve((req.result as BookmarkEntry[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSetAllEntries(entries: BookmarkEntry[]): Promise<void> {
  const db = await openAppDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ENTRIES, 'readwrite');
    const store = tx.objectStore(STORE_ENTRIES);

    store.clear();
    for (const entry of entries) {
      if (entry) {
        if (!entry.id) {
          entry.id = 'entry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
        }
        store.put(entry);
      }
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function idbPutEntry(entry: BookmarkEntry): Promise<void> {
  const db = await openAppDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ENTRIES, 'readwrite');
    const store = tx.objectStore(STORE_ENTRIES);
    if (!entry.id) {
      entry.id = 'entry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    }
    const req = store.put(entry);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbDeleteEntry(id: string): Promise<void> {
  const db = await openAppDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ENTRIES, 'readwrite');
    const store = tx.objectStore(STORE_ENTRIES);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Folders Operations ──────────────────────────────────────────

export async function idbGetAllFolders(): Promise<Folder[]> {
  const db = await openAppDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FOLDERS, 'readonly');
    const store = tx.objectStore(STORE_FOLDERS);
    const req = store.getAll();

    req.onsuccess = () => resolve((req.result as Folder[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSetAllFolders(folders: Folder[]): Promise<void> {
  const db = await openAppDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FOLDERS, 'readwrite');
    const store = tx.objectStore(STORE_FOLDERS);

    store.clear();
    for (const folder of folders) {
      if (folder) {
        if (!folder.id) {
          folder.id = 'folder_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
        }
        store.put(folder);
      }
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function idbPutFolder(folder: Folder): Promise<void> {
  const db = await openAppDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FOLDERS, 'readwrite');
    const store = tx.objectStore(STORE_FOLDERS);
    if (!folder.id) {
      folder.id = 'folder_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    }
    const req = store.put(folder);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbDeleteFolder(id: string): Promise<void> {
  const db = await openAppDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FOLDERS, 'readwrite');
    const store = tx.objectStore(STORE_FOLDERS);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Handles Operations (for Directory Picker) ───────────────────

export async function idbGetHandle(key: string): Promise<any> {
  try {
    const db = await openAppDB();
    return new Promise(resolve => {
      const tx = db.transaction(STORE_HANDLES, 'readonly');
      const store = tx.objectStore(STORE_HANDLES);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function idbSaveHandle(key: string, handle: any): Promise<boolean> {
  try {
    const db = await openAppDB();
    return new Promise(resolve => {
      const tx = db.transaction(STORE_HANDLES, 'readwrite');
      const store = tx.objectStore(STORE_HANDLES);
      const req = store.put(handle, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
