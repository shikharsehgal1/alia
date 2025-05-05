import { create } from 'zustand';

type ShareMode = 'always' | 'once' | 'never';

interface LocationState {
  shareMode: ShareMode;
  isSharing: boolean;
  setShareMode: (mode: ShareMode) => void;
  startSharing: () => void;
  stopSharing: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  shareMode: 'never',
  isSharing: false,
  
  setShareMode: (mode) => {
    set({ shareMode: mode });
    if (mode === 'always') {
      set({ isSharing: true });
    } else if (mode === 'never') {
      set({ isSharing: false });
    }
  },

  startSharing: () => {
    set((state) => {
      if (state.shareMode === 'once') {
        // If it's a one-time share, automatically stop after starting
        setTimeout(() => {
          set({ isSharing: false, shareMode: 'never' });
        }, 1000);
      }
      return { isSharing: true };
    });
  },

  stopSharing: () => {
    set({ isSharing: false });
  },
})); 