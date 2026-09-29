import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { ExportImportTab } from './ExportImportTab';
import {
  X,
  Settings,
  Table,
  LayoutGrid,
  Grid3X3,
  List,
  BookOpen,
  Layers,
  User,
  Mic,
  Check,
  HardDriveDownload,
  ClipboardList,
  VolumeX,
  Bell,
  Sliders,
  Trash2,
  Plus,
  ExternalLink,
  Sun,
  Moon,
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

  const searchModes: Array<{
    id: 'Title' | 'Series' | 'Author' | 'Narrator';
    label: string;
    desc: string;
    icon: React.ElementType;
  }> = [
    { id: 'Title', label: 'Audiobook Title', desc: 'Direct single-book query', icon: BookOpen },
    { id: 'Series', label: 'Series Universe', desc: 'Auto-scan entire series catalog & sequels', icon: Layers },
    { id: 'Author', label: 'Author Watchlist', desc: 'Auto-scan author upcoming releases', icon: User },
    { id: 'Narrator', label: 'Narrator Watchlist', desc: 'Auto-scan voice performances', icon: Mic },
  ];

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-2xl rounded-3xl border flex flex-col max-h-[92vh] overflow-hidden select-none transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl font-bold shadow-md"
            >
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-extrabold tracking-wide">
                Settings &amp; Preferences
              </h3>
              <p
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="text-xs"
              >
                Theme, default layout, watchlists, and backup tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md-btn-icon shadow-xs"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation (Material 3 Segmented Pill Row) */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center gap-1.5 px-4 pt-2.5 border-b overflow-x-auto shrink-0"
        >
          <button
            onClick={() => setActiveTab('preferences')}
            style={{
              backgroundColor: activeTab === 'preferences' ? 'var(--md-sys-color-surface)' : 'transparent',
              color: activeTab === 'preferences' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              borderColor: activeTab === 'preferences' ? 'var(--md-sys-color-primary)' : 'transparent',
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-2xl border-b-2 transition cursor-pointer shrink-0 shadow-xs"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Theme &amp; Displays</span>
          </button>

          <button
            onClick={() => setActiveTab('export_import')}
            style={{
              backgroundColor: activeTab === 'export_import' ? 'var(--md-sys-color-surface)' : 'transparent',
              color: activeTab === 'export_import' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              borderColor: activeTab === 'export_import' ? 'var(--md-sys-color-primary)' : 'transparent',
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-2xl border-b-2 transition cursor-pointer shrink-0 shadow-xs"
          >
            <HardDriveDownload className="h-3.5 w-3.5" />
            <span>Backup &amp; Restore</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlists')}
            style={{
              backgroundColor: activeTab === 'watchlists' ? 'var(--md-sys-color-surface)' : 'transparent',
              color: activeTab === 'watchlists' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              borderColor: activeTab === 'watchlists' ? 'var(--md-sys-color-primary)' : 'transparent',
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-2xl border-b-2 transition cursor-pointer shrink-0 shadow-xs"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Watchlists ({watchlists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mutelist')}
            style={{
              backgroundColor: activeTab === 'mutelist' ? 'var(--md-sys-color-surface)' : 'transparent',
              color: activeTab === 'mutelist' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              borderColor: activeTab === 'mutelist' ? 'var(--md-sys-color-primary)' : 'transparent',
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-2xl border-b-2 transition cursor-pointer shrink-0 shadow-xs"
          >
            <VolumeX className="h-3.5 w-3.5" />
            <span>Mute Rules ({muteList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            style={{
              backgroundColor: activeTab === 'notifications' ? 'var(--md-sys-color-surface)' : 'transparent',
              color: activeTab === 'notifications' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              borderColor: activeTab === 'notifications' ? 'var(--md-sys-color-primary)' : 'transparent',
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-2xl border-b-2 transition cursor-pointer shrink-0 shadow-xs"
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Alerts</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: Preferences & Theme */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Theme Selector (Material 3 Dracula & Alucard Cards) */}
              <div className="space-y-2.5">
                <label
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="text-xs font-bold uppercase tracking-wider block"
                >
                  Color Theme (Material Design)
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Alucard (Light Mode - Default) */}
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    style={{
                      backgroundColor: theme === 'light' ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-low)',
                      borderColor: theme === 'light' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)',
                      color: theme === 'light' ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
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
                      Clean Dracula light theme with #f8f8f2 canvas, deep navy text, and vibrant purple accents.
                    </p>
                  </button>

                  {/* Option 2: Dracula (Dark Mode) */}
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    style={{
                      backgroundColor: theme === 'dark' ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container-low)',
                      borderColor: theme === 'dark' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)',
                      color: theme === 'dark' ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
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
                      Iconic Dracula palette with #282a36 background, #bd93f9 purple, and pastel highlights.
                    </p>
                  </button>
                </div>
              </div>

              {/* Active View Layout (Compact Mode Only) */}
              <div
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-low)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="p-3.5 rounded-2xl border flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{
                      backgroundColor: 'var(--md-sys-color-primary)',
                      color: 'var(--md-sys-color-on-primary)',
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Active View Mode</span>
                    <span
                      style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                      className="text-[11px]"
                    >
                      Compact Poster Grid (High-density Audible release posters)
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                >
                  Compact Active
                </span>
              </div>

              {/* Default Search Mode */}
              <div className="space-y-2.5">
                <label
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="text-xs font-bold uppercase tracking-wider block"
                >
                  Default Add / Search Mode
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {searchModes.map((sm) => {
                    const Icon = sm.icon;
                    const isSelected = preferences.defaultSearchMode === sm.id;
                    return (
                      <button
                        key={sm.id}
                        type="button"
                        onClick={() => updatePreferences({ defaultSearchMode: sm.id })}
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--md-sys-color-primary-container)'
                            : 'var(--md-sys-color-surface-container-low)',
                          borderColor: isSelected
                            ? 'var(--md-sys-color-primary)'
                            : 'var(--md-sys-color-outline-variant)',
                          color: isSelected
                            ? 'var(--md-sys-color-on-primary-container)'
                            : 'var(--md-sys-color-on-surface)',
                        }}
                        className="p-3 rounded-2xl text-left border transition flex items-center justify-between shadow-xs active:scale-98 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="h-4 w-4 shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-bold truncate">{sm.label}</div>
                            <div className="text-[10px] opacity-75 truncate">{sm.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 stroke-[3] shrink-0 ml-1" />}
                      </button>
                    );
                  })}
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
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                  Mute Rules (Ignore List)
                </h4>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px]"
                >
                  Filter out spin-offs, non-English editions, or dramatized adaptations
                </p>
              </div>

              {/* Add Mute Rule Form */}
              <form
                onSubmit={handleAddMute}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-low)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="flex gap-2 p-3.5 rounded-3xl border shadow-xs"
              >
                <select
                  value={muteType}
                  onChange={(e) => setMuteType(e.target.value as any)}
                  className="md-input min-h-[44px] px-3 text-xs font-bold rounded-2xl shrink-0"
                >
                  <option value="Series">Series</option>
                  <option value="Keyword">Keyword</option>
                  <option value="Author">Author</option>
                </select>
                <input
                  type="text"
                  placeholder="Phrase to ignore (e.g. Spanish Edition, GraphicAudio)"
                  value={muteVal}
                  onChange={(e) => setMuteVal(e.target.value)}
                  className="md-input flex-1 min-h-[44px] px-3.5 text-xs font-medium rounded-2xl"
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--md-sys-color-error)',
                    color: '#ffffff',
                  }}
                  className="min-h-[44px] px-4 rounded-2xl font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-sm active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Mute</span>
                </button>
              </form>

              {/* Mute Items List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {muteList.length === 0 ? (
                  <p
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    className="text-xs text-center py-4"
                  >
                    No mute rules configured.
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
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          style={{
                            backgroundColor: 'var(--md-sys-color-error-container)',
                            color: 'var(--md-sys-color-error)',
                            borderColor: 'var(--md-sys-color-error)',
                          }}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                        >
                          {m.type}
                        </span>
                        <span className="font-bold truncate">{m.value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMuteRule(m.id)}
                        style={{
                          backgroundColor: 'var(--md-sys-color-error-container)',
                          color: 'var(--md-sys-color-error)',
                        }}
                        className="p-1.5 rounded-xl transition cursor-pointer active:scale-95 shadow-xs"
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
            <div className="space-y-4">
              <div>
                <h4
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Release Alerts &amp; Notifications
                </h4>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px]"
                >
                  Configure system push notifications for upcoming release dates
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-low)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="space-y-4 p-5 rounded-3xl border shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">System Push Notifications</span>
                    <span
                      style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                      className="text-[11px]"
                    >
                      Receive notifications when the app is in background
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={requestSystemNotificationPermission}
                    style={{
                      backgroundColor: pushSettings.pushEnabled
                        ? 'var(--md-sys-color-accent-green)'
                        : 'var(--md-sys-color-primary)',
                      color: '#ffffff',
                    }}
                    className="min-h-[40px] px-4 rounded-full text-xs font-bold cursor-pointer transition shadow-xs active:scale-95"
                  >
                    {pushSettings.pushEnabled ? 'Enabled' : 'Enable Alerts'}
                  </button>
                </div>

                <div style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }} className="h-px" />

                <div className="space-y-2.5">
                  <span className="text-xs font-bold block">Default Reminder Intervals</span>
                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushSettings.notifyOneWeek}
                      onChange={(e) => updatePushSettings({ notifyOneWeek: e.target.checked })}
                      className="rounded accent-[var(--md-sys-color-primary)] h-4 w-4"
                    />
                    <span>7 Days Before Release</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushSettings.notifyOneDay}
                      onChange={(e) => updatePushSettings({ notifyOneDay: e.target.checked })}
                      className="rounded accent-[var(--md-sys-color-primary)] h-4 w-4"
                    />
                    <span>24 Hours Before Release</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushSettings.notifyDayOf}
                      onChange={(e) => updatePushSettings({ notifyDayOf: e.target.checked })}
                      className="rounded accent-[var(--md-sys-color-primary)] h-4 w-4"
                    />
                    <span>Day of Release Morning Alert</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushSettings.soundEnabled}
                      onChange={(e) => updatePushSettings({ soundEnabled: e.target.checked })}
                      className="rounded accent-[var(--md-sys-color-primary)] h-4 w-4"
                    />
                    <span>Play Audio Chime on Alert</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="p-3.5 sm:p-4 border-t flex justify-end shrink-0"
        >
          <button
            onClick={onClose}
            className="md-btn-fab min-h-[44px] px-6 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
