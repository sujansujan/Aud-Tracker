import React, { useState } from 'react';
import { useSpecTracker } from '../../context/SpecTrackerContext';
import { Marketplace } from '../../types/specModels';
import {
  Bell,
  Globe,
  Sun,
  Moon,
  RefreshCw,
  Trash2,
  Sparkles,
  Info,
  Shield,
  FileText,
} from 'lucide-react';

const MARKETPLACES: Array<{ code: Marketplace; label: string }> = [
  { code: 'US', label: 'United States (Audible.com)' },
  { code: 'UK', label: 'United Kingdom (Audible.co.uk)' },
  { code: 'CA', label: 'Canada (Audible.ca)' },
  { code: 'AU', label: 'Australia (Audible.com.au)' },
  { code: 'DE', label: 'Germany (Audible.de)' },
  { code: 'FR', label: 'France (Audible.fr)' },
  { code: 'JP', label: 'Japan (Audible.co.jp)' },
  { code: 'IN', label: 'India (Audible.in)' },
];

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    syncNow,
    isSyncing,
    clearCache,
    triggerDemoNewAnnouncement,
    hasTriggeredDemoAnnouncement,
  } = useSpecTracker();

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLicenses, setShowLicenses] = useState(false);

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-3 space-y-6">
      <h1 className="text-xl font-medium tracking-tight text-[var(--md-sys-color-on-surface)] border-b pb-2.5">
        Settings
      </h1>

      {/* NOTIFICATIONS SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" /> Notifications
        </h2>

        <div className="rounded-xl border border-[var(--md-sys-color-outline)] divide-y divide-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)]">
          {/* Master Switch */}
          <label className="p-3.5 flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                Allow notifications
              </div>
              <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Master switch for release notifications and reminders
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsMaster}
              onChange={(e) => updateSettings({ notificationsMaster: e.target.checked })}
              className="rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)]"
            />
          </label>

          {/* Sub-options (active only if master is on) */}
          <div className={`divide-y divide-[var(--md-sys-color-outline)] ${settings.notificationsMaster ? '' : 'opacity-50 pointer-events-none'}`}>
            {[
              { key: 'notifyReleaseDay', label: 'Release day', desc: 'Notify on the day of release' },
              { key: 'notifyOneDay', label: '1 day before', desc: 'Notify 24 hours prior to release' },
              { key: 'notifyThreeDays', label: '3 days before', desc: 'Notify 3 days prior' },
              { key: 'notifyOneWeek', label: '1 week before', desc: 'Notify 7 days prior' },
              { key: 'notifyDateChanged', label: 'Release date changes', desc: 'Notify when a release date shifts' },
              { key: 'notifyNowAvailable', label: 'Now available', desc: 'Notify when a release becomes active' },
              { key: 'notifyNewAuthorBook', label: 'New book from followed author', desc: 'Notify when an author announces a book' },
              { key: 'notifyNewSeriesInstallment', label: 'New installment in followed series', desc: 'Notify when a new book in a series is announced' },
            ].map((opt) => (
              <label key={opt.key} className="p-3 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs text-[var(--md-sys-color-on-surface)]">{opt.label}</div>
                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{opt.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={(settings as any)[opt.key]}
                  onChange={(e) => updateSettings({ [opt.key]: e.target.checked })}
                  className="rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)]"
                />
              </label>
            ))}

            {/* Delivery time */}
            <div className="p-3 flex items-center justify-between text-xs">
              <span className="text-[var(--md-sys-color-on-surface)]">Delivery time</span>
              <input
                type="time"
                value={settings.deliveryTime}
                onChange={(e) => updateSettings({ deliveryTime: e.target.value })}
                className="bg-transparent border border-[var(--md-sys-color-outline)] rounded px-2 py-0.5 text-xs text-[var(--md-sys-color-on-surface)]"
              />
            </div>

            {/* Quiet Hours */}
            <div className="p-3 space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[var(--md-sys-color-on-surface)]">Quiet hours</span>
                <input
                  type="checkbox"
                  checked={settings.quietHoursEnabled}
                  onChange={(e) => updateSettings({ quietHoursEnabled: e.target.checked })}
                  className="rounded border-[var(--md-sys-color-outline)]"
                />
              </label>
              {settings.quietHoursEnabled && (
                <div className="flex items-center gap-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)] pt-1">
                  <span>From</span>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                    className="border border-[var(--md-sys-color-outline)] rounded px-1.5 py-0.5 text-xs bg-transparent"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                    className="border border-[var(--md-sys-color-outline)] rounded px-1.5 py-0.5 text-xs bg-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* REGION SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" /> Region
        </h2>

        <div className="rounded-xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-3">
          <label className="block text-[11px] text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
            Audible marketplace
          </label>
          <select
            value={settings.marketplace}
            onChange={(e) => {
              updateSettings({ marketplace: e.target.value as Marketplace });
              syncNow();
            }}
            className="w-full text-xs font-medium p-2 rounded-lg bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] outline-none cursor-pointer"
          >
            {MARKETPLACES.map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* APPEARANCE SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
          <Sun className="h-3.5 w-3.5" /> Appearance
        </h2>

        <div className="rounded-xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-3.5 flex items-center justify-between text-xs">
          <span className="text-[var(--md-sys-color-on-surface)]">Theme</span>
          <div className="flex rounded-lg border border-[var(--md-sys-color-outline)] p-0.5 bg-[var(--md-sys-color-surface-container)]">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateSettings({ theme: t })}
                className={`px-3 py-1 rounded text-xs capitalize transition cursor-pointer ${
                  settings.theme === t
                    ? 'bg-[var(--md-sys-color-surface)] font-medium text-[var(--md-sys-color-on-surface)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DATA SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Data
        </h2>

        <div className="rounded-xl border border-[var(--md-sys-color-outline)] divide-y divide-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)]">
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">Sync now</div>
              <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Last synced: {settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleString() : 'Never'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>

          {/* Test Demo Announcement Trigger */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                Simulate new announcement
              </div>
              <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Adds a newly announced book to test baseline sync notifications
              </div>
            </div>
            <button
              type="button"
              onClick={() => triggerDemoNewAnnouncement()}
              disabled={hasTriggeredDemoAnnouncement}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer disabled:opacity-50"
            >
              {hasTriggeredDemoAnnouncement ? 'Triggered' : 'Simulate'}
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">Clear cache</div>
              <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Reset local storage to original sample data
              </div>
            </div>
            <button
              type="button"
              onClick={() => clearCache()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" /> About
        </h2>

        <div className="rounded-xl border border-[var(--md-sys-color-outline)] divide-y divide-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-xs">
          <div className="p-3 flex items-center justify-between">
            <span className="text-[var(--md-sys-color-on-surface)]">App version</span>
            <span className="text-[var(--md-sys-color-on-surface-variant)]">1.0.0</span>
          </div>

          <button
            type="button"
            onClick={() => setShowPrivacy(true)}
            className="w-full p-3 flex items-center justify-between hover:bg-[var(--md-sys-color-surface-container-low)] cursor-pointer text-left"
          >
            <span className="text-[var(--md-sys-color-on-surface)]">Privacy policy</span>
            <Shield className="h-3.5 w-3.5 text-[var(--md-sys-color-on-surface-variant)]" />
          </button>

          <button
            type="button"
            onClick={() => setShowLicenses(true)}
            className="w-full p-3 flex items-center justify-between hover:bg-[var(--md-sys-color-surface-container-low)] cursor-pointer text-left"
          >
            <span className="text-[var(--md-sys-color-on-surface)]">Open-source licenses</span>
            <FileText className="h-3.5 w-3.5 text-[var(--md-sys-color-on-surface-variant)]" />
          </button>
        </div>
      </section>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] p-5 space-y-3 shadow-lg text-xs">
            <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Privacy Policy</h3>
            <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              This application is strictly offline-first. It does not collect analytics, scrape user accounts, or require third-party logins. All followed books, authors, series, and notification preferences remain on your local device.
            </p>
            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="px-3 py-1.5 rounded-lg font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Licenses Modal */}
      {showLicenses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] p-5 space-y-3 shadow-lg text-xs">
            <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Open-Source Licenses</h3>
            <div className="space-y-1 text-[var(--md-sys-color-on-surface-variant)] max-h-48 overflow-y-auto">
              <p>Android Jetpack Compose &copy; The Android Open Source Project (Apache 2.0)</p>
              <p>Room Persistence Library &copy; The Android Open Source Project (Apache 2.0)</p>
              <p>WorkManager &copy; The Android Open Source Project (Apache 2.0)</p>
              <p>Kotlin Coroutines &copy; JetBrains s.r.o. (Apache 2.0)</p>
              <p>Lucide Icons &copy; Lucide Contributors (ISC License)</p>
            </div>
            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setShowLicenses(false)}
                className="px-3 py-1.5 rounded-lg font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
