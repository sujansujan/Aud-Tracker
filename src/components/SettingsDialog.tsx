import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { ExportImportTab } from './ExportImportTab';
import {
  X,
  Settings,
  Sliders,
  HardDriveDownload,
  ClipboardList,
  VolumeX,
  Bell,
  Trash2,
  Plus,
  ExternalLink,
  Sun,
  Moon,
  Check,
  Globe,
} from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'preferences' | 'export_import' | 'watchlists' | 'mutelist' | 'notifications';
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  initialTab = 'preferences',
}) => {
  const {
    preferences,
    updatePreferences,
    watchlists,
    addWatchlistTarget,
    removeWatchlistTarget,
    muteList,
    addMuteRule,
    removeMuteRule,
    pushSettings,
    updatePushSettings,
    requestSystemNotificationPermission,
    triggerTestNotification,
    languageFilter,
    setLanguageFilter,
    theme,
    setTheme,
    showToast,
  } = useTracker();

  const [activeTab, setActiveTab] = useState<
    'preferences' | 'export_import' | 'watchlists' | 'mutelist' | 'notifications'
  >(initialTab);

  // Watchlist input state
  const [wlType, setWlType] = useState<'Author' | 'Series' | 'Narrator'>('Author');
  const [wlName, setWlName] = useState('');
  const [wlUrl, setWlUrl] = useState('');

  // Mute rule state
  const [muteType, setMuteType] = useState<'Series' | 'Keyword' | 'Author'>('Series');
  const [muteVal, setMuteVal] = useState('');

  if (!isOpen) return null;

  const handleAddWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlName.trim()) return;
    addWatchlistTarget({
      type: wlType,
      name: wlName.trim(),
      url: wlUrl.trim() || `https://www.audible.com/search?keywords=${encodeURIComponent(wlName.trim())}`,
    });
    setWlName('');
    setWlUrl('');
    showToast(`Added ${wlName} to ${wlType} Watchlist!`, 'success');
  };

  const handleAddMute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muteVal.trim()) return;
    addMuteRule({
      type: muteType,
      value: muteVal.trim(),
    });
    setMuteVal('');
    showToast(`Added mute rule for "${muteVal}"!`, 'info');
  };

  const navTabs: Array<{
    id: 'preferences' | 'export_import' | 'watchlists' | 'mutelist' | 'notifications';
    label: string;
    desc: string;
    icon: React.ElementType;
    badge?: number;
  }> = [
    {
      id: 'preferences',
      label: 'Theme & Preferences',
      desc: 'Dracula / Alucard theme and language filters',
      icon: Sliders,
    },
    {
      id: 'export_import',
      label: 'Backup & Restore',
      desc: 'JSON full backups and CSV export',
      icon: HardDriveDownload,
    },
    {
      id: 'watchlists',
      label: 'Tracked Watchlists',
      desc: 'Monitored authors, series, and narrators',
      icon: ClipboardList,
      badge: watchlists.length,
    },
    {
      id: 'mutelist',
      label: 'Mute & Ignore Rules',
      desc: 'Ignore dramatizations, translations & spin-offs',
      icon: VolumeX,
      badge: muteList.length,
    },
    {
      id: 'notifications',
      label: 'Release Alerts',
      desc: 'Push notifications & reminder intervals',
      icon: Bell,
    },
  ];

  const currentTab = navTabs.find((t) => t.id === activeTab) || navTabs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-4xl rounded-3xl border flex flex-col md:flex-row max-h-[92vh] overflow-hidden select-none transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Vertical Header Navigation Sidebar (No Horizontal Scrolling!) */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="w-full md:w-64 border-b md:border-b-0 md:border-r p-3.5 sm:p-4 flex flex-col shrink-0 space-y-2"
        >
          {/* Top Title Bar */}
          <div className="flex items-center justify-between pb-2.5 mb-1 border-b border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  backgroundColor: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                }}
                className="flex h-9 w-9 items-center justify-center rounded-2xl font-bold shadow-sm"
              >
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-extrabold">Settings</h3>
                <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-[10px]">
                  Preferences &amp; Tools
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md-btn-icon h-8 w-8 min-h-0 min-w-0 md:hidden shadow-xs"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Vertical Menu Buttons */}
          <nav className="flex flex-col gap-1.5 w-full">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    backgroundColor: isActive
                      ? 'var(--md-sys-color-primary-container)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--md-sys-color-on-primary-container)'
                      : 'var(--md-sys-color-on-surface-variant)',
                    borderColor: isActive
                      ? 'var(--md-sys-color-primary)'
                      : 'transparent',
                  }}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl text-left font-bold text-xs transition border cursor-pointer active:scale-98 ${
                    isActive ? 'shadow-xs' : 'hover:bg-[var(--md-sys-color-surface-container)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: isActive ? 'var(--md-sys-color-primary)' : undefined }}
                    />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      style={{
                        backgroundColor: isActive
                          ? 'var(--md-sys-color-primary)'
                          : 'var(--md-sys-color-surface-container-high)',
                        color: isActive
                          ? 'var(--md-sys-color-on-primary)'
                          : 'var(--md-sys-color-on-surface-variant)',
                      }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums shrink-0"
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Desktop Right Header */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="hidden md:flex items-center justify-between p-4 sm:p-5 border-b shrink-0"
          >
            <div>
              <h4 className="font-display text-base font-extrabold">{currentTab.label}</h4>
              <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-xs">
                {currentTab.desc}
              </p>
            </div>
            <button
              onClick={onClose}
              className="md-btn-icon shadow-xs"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* TAB 1: Preferences & Theme */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Theme Selector */}
                <div className="space-y-2.5">
                  <label
                    style={{ color: 'var(--md-sys-color-primary)' }}
                    className="text-xs font-bold uppercase tracking-wider block"
                  >
                    Color Theme
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Alucard (Light Mode - Default) */}
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      style={{
                        backgroundColor:
                          theme === 'light'
                            ? 'var(--md-sys-color-primary-container)'
                            : 'var(--md-sys-color-surface-container-low)',
                        borderColor:
                          theme === 'light'
                            ? 'var(--md-sys-color-primary)'
                            : 'var(--md-sys-color-outline-variant)',
                        color:
                          theme === 'light'
                            ? 'var(--md-sys-color-on-primary-container)'
                            : 'var(--md-sys-color-on-surface)',
                      }}
                      className="p-4 rounded-3xl border-2 text-left transition cursor-pointer flex flex-col justify-between shadow-xs active:scale-98"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Sun className="h-5 w-5 text-amber-500" />
                          <span>Alucard Light (Default)</span>
                        </div>
                        {theme === 'light' && <Check className="h-4 w-4 stroke-[3]" />}
                      </div>
                      <p className="text-xs opacity-80 leading-relaxed">
                        Dracula light counterpart with ivory #f8f8f2 canvas, deep navy text, and purple accents.
                      </p>
                    </button>

                    {/* Option 2: Dracula (Dark Mode) */}
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      style={{
                        backgroundColor:
                          theme === 'dark'
                            ? 'var(--md-sys-color-primary-container)'
                            : 'var(--md-sys-color-surface-container-low)',
                        borderColor:
                          theme === 'dark'
                            ? 'var(--md-sys-color-primary)'
                            : 'var(--md-sys-color-outline-variant)',
                        color:
                          theme === 'dark'
                            ? 'var(--md-sys-color-on-primary-container)'
                            : 'var(--md-sys-color-on-surface)',
                      }}
                      className="p-4 rounded-3xl border-2 text-left transition cursor-pointer flex flex-col justify-between shadow-xs active:scale-98"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Moon className="h-5 w-5 text-purple-400" />
                          <span>Dracula Dark</span>
                        </div>
                        {theme === 'dark' && <Check className="h-4 w-4 stroke-[3]" />}
                      </div>
                      <p className="text-xs opacity-80 leading-relaxed">
                        Canonical Dracula palette with #282a36 background, #bd93f9 purple, and pastel highlights.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Language Tracker Setting */}
                <div className="space-y-2.5">
                  <label
                    style={{ color: 'var(--md-sys-color-primary)' }}
                    className="text-xs font-bold uppercase tracking-wider block"
                  >
                    Audible Language Tracker Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setLanguageFilter('english_only')}
                      style={{
                        backgroundColor:
                          languageFilter === 'english_only'
                            ? 'var(--md-sys-color-primary-container)'
                            : 'var(--md-sys-color-surface-container-low)',
                        borderColor:
                          languageFilter === 'english_only'
                            ? 'var(--md-sys-color-primary)'
                            : 'var(--md-sys-color-outline-variant)',
                        color:
                          languageFilter === 'english_only'
                            ? 'var(--md-sys-color-on-primary-container)'
                            : 'var(--md-sys-color-on-surface)',
                      }}
                      className="p-3.5 rounded-2xl text-left border transition flex items-center justify-between shadow-xs active:scale-98 cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-xs">English Releases Only</div>
                        <div className="text-[11px] opacity-75 mt-0.5">
                          Automatically filters out foreign translations
                        </div>
                      </div>
                      {languageFilter === 'english_only' && <Check className="h-4 w-4 stroke-[3]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLanguageFilter('all_languages')}
                      style={{
                        backgroundColor:
                          languageFilter === 'all_languages'
                            ? 'var(--md-sys-color-primary-container)'
                            : 'var(--md-sys-color-surface-container-low)',
                        borderColor:
                          languageFilter === 'all_languages'
                            ? 'var(--md-sys-color-primary)'
                            : 'var(--md-sys-color-outline-variant)',
                        color:
                          languageFilter === 'all_languages'
                            ? 'var(--md-sys-color-on-primary-container)'
                            : 'var(--md-sys-color-on-surface)',
                      }}
                      className="p-3.5 rounded-2xl text-left border transition flex items-center justify-between shadow-xs active:scale-98 cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-xs">All Languages</div>
                        <div className="text-[11px] opacity-75 mt-0.5">
                          Track German, Spanish, French &amp; regional releases
                        </div>
                      </div>
                      {languageFilter === 'all_languages' && <Check className="h-4 w-4 stroke-[3]" />}
                    </button>
                  </div>
                </div>

                {/* Default Startup View Filter */}
                <div className="space-y-2.5">
                  <label
                    style={{ color: 'var(--md-sys-color-primary)' }}
                    className="text-xs font-bold uppercase tracking-wider block"
                  >
                    Default Startup Filter
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'upcoming', 'today', 'downloaded', 'listened'] as const).map((filterId) => {
                      const isSelected = preferences.defaultViewFilter === filterId;
                      const label =
                        filterId === 'all'
                          ? 'All Releases'
                          : filterId === 'upcoming'
                          ? 'Upcoming Only'
                          : filterId === 'today'
                          ? 'Releasing Today'
                          : filterId === 'downloaded'
                          ? 'Downloaded'
                          : 'Listened';
                      return (
                        <button
                          key={filterId}
                          type="button"
                          onClick={() => updatePreferences({ defaultViewFilter: filterId })}
                          className={`md-chip ${isSelected ? 'md-chip-active shadow-sm' : ''}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Export & Import */}
            {activeTab === 'export_import' && <ExportImportTab />}

            {/* TAB 3: Watchlists Manager */}
            {activeTab === 'watchlists' && (
              <div className="space-y-4">
                <div>
                  <h4
                    style={{ color: 'var(--md-sys-color-primary)' }}
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    Tracked Watchlists
                  </h4>
                  <p
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    className="text-[11px]"
                  >
                    Authors, Series, and Narrators monitored for upcoming releases
                  </p>
                </div>

                {/* Add Watchlist Form */}
                <form
                  onSubmit={handleAddWatchlist}
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="space-y-2.5 p-3.5 rounded-3xl border shadow-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={wlType}
                      onChange={(e) => setWlType(e.target.value as any)}
                      className="md-input min-h-[44px] px-3 text-xs font-bold rounded-2xl"
                    >
                      <option value="Author">Author</option>
                      <option value="Series">Series</option>
                      <option value="Narrator">Narrator</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Target Name (e.g. Brandon Sanderson)"
                      value={wlName}
                      onChange={(e) => setWlName(e.target.value)}
                      className="md-input sm:col-span-2 min-h-[44px] px-3.5 text-xs font-medium rounded-2xl"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Optional Audible URL or search keyword"
                      value={wlUrl}
                      onChange={(e) => setWlUrl(e.target.value)}
                      className="md-input flex-1 min-h-[44px] px-3.5 text-xs font-medium rounded-2xl"
                    />
                    <button
                      type="submit"
                      className="md-btn-fab min-h-[44px] px-5 text-xs font-bold"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      <span>Add</span>
                    </button>
                  </div>
                </form>

                {/* Watchlist Items List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {watchlists.length === 0 ? (
                    <p
                      style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                      className="text-xs text-center py-4"
                    >
                      No watchlists configured.
                    </p>
                  ) : (
                    watchlists.map((w) => (
                      <div
                        key={w.id}
                        style={{
                          backgroundColor: 'var(--md-sys-color-surface)',
                          borderColor: 'var(--md-sys-color-outline-variant)',
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl border text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            style={{
                              backgroundColor:
                                w.type === 'Series'
                                  ? 'var(--md-sys-color-primary-container)'
                                  : w.type === 'Author'
                                  ? 'var(--md-sys-color-secondary-container)'
                                  : 'var(--md-sys-color-accent-green-container)',
                              color:
                                w.type === 'Series'
                                  ? 'var(--md-sys-color-on-primary-container)'
                                  : w.type === 'Author'
                                  ? 'var(--md-sys-color-secondary)'
                                  : 'var(--md-sys-color-accent-green)',
                            }}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                          >
                            {w.type}
                          </span>
                          <span className="font-bold truncate">{w.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {w.url && (
                            <a
                              href={w.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--md-sys-color-primary)' }}
                              className="p-1.5 rounded-lg hover:bg-[var(--md-sys-color-surface-container)] transition"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => removeWatchlistTarget(w.id)}
                            style={{
                              backgroundColor: 'var(--md-sys-color-error-container)',
                              color: 'var(--md-sys-color-error)',
                            }}
                            className="p-1.5 rounded-xl transition cursor-pointer active:scale-95 shadow-xs"
                            title="Delete watchlist target"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Mute Rules */}
            {activeTab === 'mutelist' && (
              <div className="space-y-4">
                <div>
                  <h4
                    style={{ color: 'var(--md-sys-color-primary)' }}
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    Mute &amp; Ignore Rules
                  </h4>
                  <p
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    className="text-[11px]"
                  >
                    Audiobooks matching these keywords or series will be filtered out
                  </p>
                </div>

                {/* Add Mute Rule Form */}
                <form
                  onSubmit={handleAddMute}
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="p-3.5 rounded-3xl border shadow-xs space-y-2.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={muteType}
                      onChange={(e) => setMuteType(e.target.value as any)}
                      className="md-input min-h-[44px] px-3 text-xs font-bold rounded-2xl"
                    >
                      <option value="Series">Series</option>
                      <option value="Keyword">Keyword</option>
                      <option value="Author">Author</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Rule value (e.g. Spanish Edition, GraphicAudio)"
                      value={muteVal}
                      onChange={(e) => setMuteVal(e.target.value)}
                      className="md-input sm:col-span-2 min-h-[44px] px-3.5 text-xs font-medium rounded-2xl"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="md-btn-fab min-h-[44px] px-5 text-xs font-bold"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      <span>Add Mute Rule</span>
                    </button>
                  </div>
                </form>

                {/* Mute Rules List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {muteList.length === 0 ? (
                    <p
                      style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                      className="text-xs text-center py-4"
                    >
                      No mute filters set.
                    </p>
                  ) : (
                    muteList.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          backgroundColor: 'var(--md-sys-color-surface)',
                          borderColor: 'var(--md-sys-color-outline-variant)',
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl border text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              backgroundColor: 'var(--md-sys-color-surface-container)',
                              color: 'var(--md-sys-color-on-surface-variant)',
                            }}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          >
                            {m.type}
                          </span>
                          <span className="font-bold">{m.value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMuteRule(m.id)}
                          style={{
                            backgroundColor: 'var(--md-sys-color-error-container)',
                            color: 'var(--md-sys-color-error)',
                          }}
                          className="p-1.5 rounded-xl transition cursor-pointer active:scale-95 shadow-xs"
                          title="Remove rule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: Notifications & Alerts */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div>
                  <h4
                    style={{ color: 'var(--md-sys-color-primary)' }}
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    Native Android Notification System
                  </h4>
                  <p
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    className="text-[11px]"
                  >
                    Direct Android system status bar alerts and release reminders
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="p-4 rounded-3xl border space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold block">Android Notification Permission</span>
                      <span
                        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        className="text-[11px]"
                      >
                        {pushSettings.pushEnabled
                          ? 'Permission granted - Native alerts active'
                          : 'Tap to request native OS notification access'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={requestSystemNotificationPermission}
                      className="md-btn-fab min-h-[38px] px-3.5 text-xs font-bold"
                    >
                      {pushSettings.pushEnabled ? 'Permission Active' : 'Request Android Permission'}
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-xs font-bold block">Default Reminder Intervals</span>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushSettings.notifyOneWeek}
                        onChange={(e) => updatePushSettings({ notifyOneWeek: e.target.checked })}
                        className="accent-[var(--md-sys-color-primary)] rounded"
                      />
                      <span>Alert 1 Week Prior to Release</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushSettings.notifyOneDay}
                        onChange={(e) => updatePushSettings({ notifyOneDay: e.target.checked })}
                        className="accent-[var(--md-sys-color-primary)] rounded"
                      />
                      <span>Alert 1 Day Prior (Tomorrow!)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushSettings.notifyDayOf}
                        onChange={(e) => updatePushSettings({ notifyDayOf: e.target.checked })}
                        className="accent-[var(--md-sys-color-primary)] rounded"
                      />
                      <span>Alert on Day of Release</span>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold block">Test Android Notification</span>
                      <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-[11px]">
                        Post a sample alert to test your notification shade
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={triggerTestNotification}
                      className="md-btn-outlined min-h-[38px] px-3.5 text-xs font-bold"
                    >
                      Send Test Alert
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
