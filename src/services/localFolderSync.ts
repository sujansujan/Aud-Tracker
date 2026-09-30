import { LocalSyncConfig, Audiobook, Author, Narrator, Series, WatchlistItem, NotificationLogItem, PushNotificationSettings } from '../types/audiobook';

export interface LocalSyncPayload {
  version: string;
  exportedAt: string;
  audiobooks: Audiobook[];
  authors: Author[];
  narrators: Narrator[];
  series: Series[];
  watchlists: WatchlistItem[];
  notifications: NotificationLogItem[];
  pushSettings: PushNotificationSettings;
  marketplace: string;
}

const LOCAL_STORAGE_KEY_SYNC_CONFIG = 'audible_tracker_local_sync_config';

export const getInitialSyncConfig = (): LocalSyncConfig => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SYNC_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return {
    folderName: 'Not Connected',
    lastSyncedAt: null,
    autoSyncEnabled: false,
    syncStatus: 'idle',
  };
};

export const saveSyncConfig = (config: LocalSyncConfig) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SYNC_CONFIG, JSON.stringify(config));
  } catch {}
};

// Global reference to directory handle if supported
let directoryHandle: any = null;

export const isDirectoryPickerSupported = (): boolean => {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
};

/**
 * Prompt user to select a local folder on their device
 */
export const selectLocalFolder = async (): Promise<string> => {
  if (isDirectoryPickerSupported()) {
    try {
      directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });
      return directoryHandle.name;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        throw new Error('Selection cancelled');
      }
      throw e;
    }
  } else {
    // Fallback: Use virtual local directory in browser filesystem / downloads
    return 'Local Storage / Documents Folder';
  }
};

/**
 * Write sync payload directly into the selected local folder
 */
export const syncToLocalFolder = async (
  payload: LocalSyncPayload,
  folderName: string
): Promise<{ success: boolean; syncedAt: string }> => {
  const jsonContent = JSON.stringify(payload, null, 2);
  const now = new Date().toISOString();

  if (directoryHandle) {
    try {
      // Write main data file
      const fileHandle = await directoryHandle.getFileHandle('audiobook_tracker_sync.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(jsonContent);
      await writable.close();

      // Write manifest file with sync metadata
      const manifestHandle = await directoryHandle.getFileHandle('sync_manifest.json', { create: true });
      const manifestWritable = await manifestHandle.createWritable();
      const manifest = {
        lastSyncedAt: now,
        device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Android App',
        bookCount: payload.audiobooks.length,
        version: payload.version,
      };
      await manifestWritable.write(JSON.stringify(manifest, null, 2));
      await manifestWritable.close();

      return { success: true, syncedAt: now };
    } catch (err: any) {
      console.warn('Direct file handle write failed, falling back to download:', err);
    }
  }

  // Fallback: Trigger instant file download to local folder
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audiobook_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, syncedAt: now };
};

/**
 * Read backup data from selected local folder
 */
export const restoreFromLocalFolder = async (): Promise<LocalSyncPayload | null> => {
  if (directoryHandle) {
    try {
      const fileHandle = await directoryHandle.getFileHandle('audiobook_tracker_sync.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text) as LocalSyncPayload;
    } catch (e) {
      console.warn('Could not read from directory handle:', e);
    }
  }

  // Fallback: Open file input picker
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const text = await file.text();
        const data = JSON.parse(text) as LocalSyncPayload;
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid backup file format'));
      }
    };
    input.click();
  });
};
