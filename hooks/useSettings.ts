"use client";

import { useState, useEffect, useCallback } from 'react';
import { storage, UserSettings, DEFAULT_SETTINGS } from '@/lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = storage.getSettings();
    setSettings(loadedSettings);
    setIsLoaded(true);
  }, []);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      storage.saveSettings({ [key]: value });
      return newSettings;
    });
  }, []);

  // Update multiple settings at once
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      storage.saveSettings(newSettings);
      return merged;
    });
  }, []);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    storage.saveSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    isLoaded,
    updateSetting,
    updateSettings,
    resetSettings,
  };
}

