import { create } from 'zustand';
import { AppSettings } from '@/types';

type SettingsState = {
  settings: AppSettings;
};

type SettingsActions = {
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>((set) => ({
  settings: {
    searchRadius: 5, // 5km default
    showNotifications: true,
    allowLocationSharing: true,
    darkMode: false,
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      }
    }));
  },

  toggleDarkMode: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        darkMode: !state.settings.darkMode,
      }
    }));
  },
}));