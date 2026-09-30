import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  FolderSync,
  Bell,
  Sun,
  Moon,
  Globe,
  HardDrive,
  ShieldCheck,
  Info,
  RefreshCw,
  FolderOpen,
  Download,
  Upload,
  Calendar,
} from 'lucide-react';

const MARKETPLACES = [
  { code: 'US', name: 'United States (Audible.com)', domain: 'audible.com' },
  { code: 'UK', name: 'United Kingdom (Audible.co.uk)', domain: 'audible.co.uk' },
  { code: 'CA', name: 'Canada (Audible.ca)', domain: 'audible.ca' },
  { code: 'AU', name: 'Australia (Audible.com.au)', domain: 'audible.com.au' },
  { code: 'DE', name: 'Germany (Audible.de)', domain: 'audible.de' },
  { code: 'FR', name: 'France (Audible.fr)', domain: 'audible.fr' },
  { code: 'JP', name: 'Japan (Audible.co.jp)', domain: 'audible.co.jp' },
];

export const SettingsScreen: React.FC = () => {
  const {
    syncConfig,
    connectLocalFolder,
    performLocalSync,
    performLocalRestore,
    toggleAutoSync,
    pushSettings,
    updatePushSettings,
    preferences,
    updatePreferences,
    theme,
    toggleTheme,
  } = useTracker();

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
          Preferences &amp; Storage
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Settings
        </h1>
      </div>

      {/* SECTION 1: LOCAL FOLDER SYNC (NO ACCOUNTS - 100% LOCAL PRIVACY) */}
      <section
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="rounded-3xl border p-4 sm:p-5 space-y-4 shadow-xs"
        aria-labelledby="local-sync-heading"
      >
        <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)]">
          <FolderSync className="h-5 w-5" />
          <h2 id="local-sync-heading" className="text-sm font-extrabold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
            Local Storage &amp; Folder Sync
          </h2>
        </div>

        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          No cloud accounts or external servers required. Your followed releases and history sync directly to a private local folder on your device.
        </p>

        {/* Sync Folder Status Card */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Target Local Folder
            </span>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-[var(--md-sys-color-primary)] shrink-0" />
              <span className="text-sm font-bold truncate">
                {syncConfig.folderName}
              </span>
            </div>
            <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              {syncConfig.lastSyncedAt
                ? `Last synchronized: ${new Date(syncConfig.lastSyncedAt).toLocaleString()}`
                : 'Never synchronized yet'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={connectLocalFolder}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-surface)] cursor-pointer"
            >
              Choose Folder
            </button>
            <button
              type="button"
              onClick={performLocalSync}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs hover:opacity-90 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync Now
            </button>
          </div>
        </div>

        {/* Auto Sync Toggle & Restore */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center justify-between p-3 rounded-2xl border cursor-pointer hover:bg-[var(--md-sys-color-surface-container-low)]">
            <div>
              <div className="text-xs font-bold">Auto-Sync on Changes</div>
              <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Automatically saves backups to local folder
              </div>
            </div>
            <input
              type="checkbox"
              checked={syncConfig.autoSyncEnabled}
              onChange={(e) => toggleAutoSync(e.target.checked)}
              className="rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)] h-4.5 w-4.5"
            />
          </label>

          <button
            type="button"
            onClick={performLocalRestore}
            className="flex items-center justify-between p-3 rounded-2xl border text-left cursor-pointer hover:bg-[var(--md-sys-color-surface-container-low)]"
          >
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-[var(--md-sys-color-primary)]" />
                Restore from Local Folder
              </div>
              <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Load audiobooks from sync backup file
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* SECTION 2: RELEASE NOTIFICATIONS */}
      <section
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="rounded-3xl border p-4 sm:p-5 space-y-4 shadow-xs"
        aria-labelledby="notifications-heading"
      >
        <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)]">
          <Bell className="h-5 w-5" />
          <h2 id="notifications-heading" className="text-sm font-extrabold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
            Release Notifications &amp; Alerts
          </h2>
        </div>

        <div className="space-y-2">
          {[
            { key: 'notifyDayOf', label: 'On Release Day', desc: 'Alert immediately when audiobooks become available' },
            { key: 'notifyOneDay', label: '1 Day Before Release', desc: 'Heads-up alert 24 hours prior to release' },
            { key: 'notifyThreeDays', label: '3 Days Before Release', desc: 'Reminder 3 days in advance' },
            { key: 'notifyOneWeek', label: '1 Week Before Release', desc: 'Early milestone alert 7 days out' },
            { key: 'notifyDateChanged', label: 'Release Date Changed (Differentiating Feature)', desc: 'Detect and alert when Audible dates shift earlier or later' },
            { key: 'notifyNewSeries', label: 'New Followed Series Installment', desc: 'Alert when a new sequel or spin-off is announced' },
            { key: 'notifyNewAuthor', label: 'New Followed Author Audiobook', desc: 'Alert when followed authors announce new releases' },
            { key: 'notifyNewNarrator', label: 'New Followed Narrator Release', desc: 'Alert when favorite narrators record a new audiobook' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[var(--md-sys-color-surface-container-low)] cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={(pushSettings as any)[item.key]}
                onChange={(e) => updatePushSettings({ [item.key]: e.target.checked })}
                className="rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)] h-4.5 w-4.5"
              />
            </label>
          ))}
        </div>
      </section>

      {/* SECTION 3: AUDIBLE MARKETPLACE */}
      <section
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="rounded-3xl border p-4 sm:p-5 space-y-3 shadow-xs"
        aria-labelledby="marketplace-heading"
      >
        <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)]">
          <Globe className="h-5 w-5" />
          <h2 id="marketplace-heading" className="text-sm font-extrabold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
            Audible Marketplace Region
          </h2>
        </div>

        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
          Controls which regional store opens when you click "Open in Audible" for regional release date consistency.
        </p>

        <select
          value={preferences.defaultMarketplace}
          onChange={(e) => updatePreferences({ defaultMarketplace: e.target.value })}
          className="w-full p-3 rounded-2xl border text-xs font-bold bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)]"
        >
          {MARKETPLACES.map((m) => (
            <option key={m.code} value={m.code}>
              {m.name}
            </option>
          ))}
        </select>
      </section>

      {/* SECTION 4: APPEARANCE & THEME */}
      <section
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="rounded-3xl border p-4 sm:p-5 space-y-4 shadow-xs"
        aria-labelledby="appearance-heading"
      >
        <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)]">
          {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <h2 id="appearance-heading" className="text-sm font-extrabold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
            Appearance
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold">Dracula Dark Palette</div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              Switch between Dracula Dark and Alucard Light
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] cursor-pointer"
          >
            {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
          </button>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <div className="text-xs font-bold">Comfort Large Text</div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              Scale typography up for easier reading by seniors &amp; kids
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.comfortTextMode}
            onChange={(e) => updatePreferences({ comfortTextMode: e.target.checked })}
            className="rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)] h-4.5 w-4.5 cursor-pointer"
          />
        </div>
      </section>

      {/* SECTION 5: ABOUT & PRIVACY */}
      <section
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="rounded-3xl border p-4 sm:p-5 space-y-2 text-xs"
        aria-labelledby="about-heading"
      >
        <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)]">
          <ShieldCheck className="h-4.5 w-4.5" />
          <h2 id="about-heading" className="font-extrabold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
            Privacy &amp; Offline Architecture
          </h2>
        </div>
        <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          This application operates completely offline-first with zero accounts, zero tracking, and zero personal credentials stored. All release notifications run through native Android channels and background WorkManager synchronization.
        </p>
        <p className="font-bold pt-1 text-[var(--md-sys-color-primary)]">
          Audible Release Tracker v2.5.0 (Kotlin / Compose Native + Local Sync)
        </p>
      </section>
    </div>
  );
};
