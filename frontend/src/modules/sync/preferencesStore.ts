import { create } from 'zustand';

const STORAGE_KEY = 'aralsync:syncPrefs';

export interface SyncPreferences {
  autoSync:               boolean;
  syncInterval:           '1' | '5' | '15' | 'manual';
  wifiOnly:               boolean;
  backgroundSync:         boolean;
  showTransmutationTable: boolean;
}

const DEFAULTS: SyncPreferences = {
  autoSync:               true,
  syncInterval:           '5',
  wifiOnly:               true,
  backgroundSync:         false,
  showTransmutationTable: false,
};

function load(): SyncPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SyncPreferences>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function save(prefs: SyncPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

interface PreferencesState extends SyncPreferences {
  setAutoSync:               (v: boolean) => void;
  setSyncInterval:           (v: SyncPreferences['syncInterval']) => void;
  setWifiOnly:               (v: boolean) => void;
  setBackgroundSync:         (v: boolean) => void;
  setShowTransmutationTable: (v: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...load(),

  setAutoSync: (v) => {
    const next = { ...get(), autoSync: v };
    save(next);
    set({ autoSync: v });
  },

  setSyncInterval: (v) => {
    const next = { ...get(), syncInterval: v };
    save(next);
    set({ syncInterval: v });
  },

  setWifiOnly: (v) => {
    const next = { ...get(), wifiOnly: v };
    save(next);
    set({ wifiOnly: v });
  },

  setBackgroundSync: (v) => {
    const next = { ...get(), backgroundSync: v };
    save(next);
    set({ backgroundSync: v });
  },

  setShowTransmutationTable: (v) => {
    const next = { ...get(), showTransmutationTable: v };
    save(next);
    set({ showTransmutationTable: v });
  },
}));
