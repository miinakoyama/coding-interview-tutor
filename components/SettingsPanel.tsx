"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Code2, RotateCcw } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/interview-flow';
import { UserSettings } from '@/lib/storage';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  onResetSettings: () => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  onResetSettings,
}: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Settings sections */}
              <div className="space-y-6">
                {/* Voice Settings */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Voice
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        {settings.voiceEnabled ? (
                          <Volume2 size={20} className="text-blue-600" />
                        ) : (
                          <VolumeX size={20} className="text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">Voice Input</p>
                          <p className="text-xs text-gray-500">Enable microphone for voice input</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.voiceEnabled}
                        onChange={(e) => onUpdateSetting('voiceEnabled', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Volume2 size={20} className={settings.autoSpeakResponses ? 'text-blue-600' : 'text-gray-400'} />
                        <div>
                          <p className="font-medium text-gray-900">Auto-speak Responses</p>
                          <p className="text-xs text-gray-500">Read AI responses aloud</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoSpeakResponses}
                        onChange={(e) => onUpdateSetting('autoSpeakResponses', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </section>

                {/* Code Settings */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Code
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Code2 size={20} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Default Language</p>
                        <p className="text-xs text-gray-500">Used when starting new sessions</p>
                      </div>
                    </div>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => onUpdateSetting('defaultLanguage', e.target.value as SupportedLanguage)}
                      className="w-full mt-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                {/* Reset */}
                <section className="pt-4 border-t">
                  <button
                    onClick={() => {
                      onResetSettings();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <RotateCcw size={16} />
                    <span>Reset to Defaults</span>
                  </button>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

