/**
 * Settings hook with localStorage persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings, DEFAULT_SETTINGS } from '@/types/game';

interface SettingsStore {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

/**
 * Zustand store for game settings with localStorage persistence.
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'blackjack-settings',
    }
  )
);

