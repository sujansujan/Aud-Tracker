import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { ExportImportTab } from './ExportImportTab';
import {
  X,
  Menu,
  Globe,
  Check,
  User,
  Layers,
  Mic,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  HardDriveDownload,
  VolumeX,
  Sliders,
  Bell,
  Headphones,
  Sun,
  Moon,
} from 'lucide-react';

interface HamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
}

export const HamburgerDrawer: React.FC<HamburgerDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAddModal,
  onOpenSettingsModal,
}) => {
  const {
    watchlists,
    addWatchlistTarget,
    removeWatchlistTarget,
    scanSingleTarget,
    isScanning,
    muteList,
    addMuteRule,
    removeMuteRule,
    languageFilter,
    setLanguageFilter,
    theme,
    toggleTheme,
    showToast,
  } = useTracker();

  // Drawer tabs
  const [activeSection, setActiveSection] = useState<'watchlists' | 'language' | 'backup' | 'mutelist'>('watchlists');
  const [watchlistType, setWatchlistType] = useState<'Author' | 'Series' | 'Narrator'>('Author');

  // Add target form inputs
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');

  // Add mute form inputs
  const [newMuteType, setNewMuteType] = useState<'Series' | 'Keyword' | 'Author'>('Series');
  const [newMuteValue, setNewMuteValue] = useState('');

  if (!isOpen) return null;

  const authorsList = watchlists.filter((w) => w.type === 'Author');
  const seriesList = watchlists.filter((w) => w.type === 'Series');
  const narratorsList = watchlists.filter((w) => w.type === 'Narrator');

  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetName.trim()) return;

    addWatchlistTarget({
      type: watchlistType,
      name: newTargetName.trim(),
      url: newTargetUrl.trim() || `https://www.audible.com/search?keywords=${encodeURIComponent(newTargetName.trim())}`,
    });

    showToast(`Added ${newTargetName} to ${watchlistType} Watchlist!`, 'success');
    setNewTargetName('');
    setNewTargetUrl('');
  };

  const handleAddMute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMuteValue.trim()) return;

    addMuteRule({
      type: newMuteType,
      value: newMuteValue.trim(),
    });

    showToast(`Added mute rule for "${newMuteValue}"!`, 'info');
    setNewMuteValue('');
  };

  const handleScanTarget = async (item: any) => {
    const count = await scanSingleTarget(item);
    showToast(count > 0 ? `Found ${count} new release(s) for ${item.name}!` : `No new releases found for ${item.name}.`, count > 0 ? 'success' : 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel (Material 3 Modal Navigation Drawer) */}
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
          color: 'var(--md-sys-color-on-surface)',
        }}
        className="relative w-full max-w-md border-r shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-250 select-none transition-colors duration-200"
      >
        {/* Drawer Header */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="pt-safe pb-3.5 border-b px-4 sm:px-5 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl font-bold shadow-md"
            >
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-sm font-extrabold tracking-wide">
                Menu &amp; Management
              </h2>
              <p
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="text-[11px]"
              >
                Watchlists, filters &amp; theme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Theme Switch in Drawer */}
            <button
              onClick={toggleTheme}
              className="md-btn-icon shadow-xs"
              title={theme === 'dark' ? 'Switch to Alucard Light' : 'Switch to Dracula Dark'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 text-purple-600" />
              )}
            </button>

            <button
              onClick={onClose}
              className="md-btn-icon shadow-xs"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Section Buttons (Material Segmented Navigation Tabs) */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="grid grid-cols-4 p-2 border-b gap-1.5 shrink-0"
        >
          <button
            onClick={() => setActiveSection('watchlists')}
            style={{
              backgroundColor: activeSection === 'watchlists' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: activeSection === 'watchlists' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-2xl text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <User className="h-4 w-4 mb-0.5" />
            <span>Tracked ({watchlists.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('language')}
            style={{
              backgroundColor: activeSection === 'language' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: activeSection === 'language' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-2xl text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Globe className="h-4 w-4 mb-0.5" />
            <span>Language</span>
          </button>

          <button
            onClick={() => setActiveSection('backup')}
            style={{
              backgroundColor: activeSection === 'backup' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: activeSection === 'backup' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-2xl text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <HardDriveDownload className="h-4 w-4 mb-0.5" />
            <span>Backup</span>
          </button>

          <button
            onClick={() => setActiveSection('mutelist')}
            style={{
              backgroundColor: activeSection === 'mutelist' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: activeSection === 'mutelist' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="min-h-[44px] flex flex-col items-center justify-center p-1.5 rounded-2xl text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <VolumeX className="h-4 w-4 mb-0.5" />
            <span>Mute ({muteList.length})</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* SECTION 1: WATCHLISTS (AUTHORS, SERIES, NARRATORS) */}
          {activeSection === 'watchlists' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Tracked Watchlists
                </h3>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px]"
                >
                  Authors, series, and narrators scanned for releases
                </p>
              </div>

              {/* Sub-tabs: Authors, Series, Narrators */}
              <div
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="flex items-center gap-1.5 p-1 rounded-2xl border"
              >
                <button
                  type="button"
                  onClick={() => setWatchlistType('Author')}
                  style={{
                    backgroundColor: watchlistType === 'Author' ? 'var(--md-sys-color-primary)' : 'transparent',
                    color: watchlistType === 'Author' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
                  }}
                  className="flex-1 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Authors ({authorsList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWatchlistType('Series')}
                  style={{
                    backgroundColor: watchlistType === 'Series' ? 'var(--md-sys-color-primary)' : 'transparent',
                    color: watchlistType === 'Series' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
                  }}
                  className="flex-1 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Series ({seriesList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWatchlistType('Narrator')}
                  style={{
                    backgroundColor: watchlistType === 'Narrator' ? 'var(--md-sys-color-primary)' : 'transparent',
                    color: watchlistType === 'Narrator' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
                  }}
                  className="flex-1 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Narrators ({narratorsList.length})</span>
                </button>
              </div>

              {/* Add Target Quick Form */}
              <form
                onSubmit={handleAddTarget}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-low)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="p-3.5 rounded-3xl border space-y-2.5 shadow-sm"
              >
                <span className="text-xs font-bold block">
                  + Track New {watchlistType}
                </span>
                <input
                  type="text"
                  placeholder={`Enter ${watchlistType} name...`}
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  className="md-input w-full min-h-[44px] px-4 text-xs font-medium"
                />
                <button
                  type="submit"
                  disabled={!newTargetName.trim()}
                  className="md-btn-fab w-full min-h-[44px] text-xs font-bold"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Track This {watchlistType}</span>
                </button>
              </form>

              {/* List of Tracked Targets */}
              <div className="space-y-2">
                {(() => {
                  const currentList =
                    watchlistType === 'Author'
                      ? authorsList
                      : watchlistType === 'Series'
                      ? seriesList
                      : narratorsList;

                  if (currentList.length === 0) {
                    return (
                      <div
                        style={{
                          backgroundColor: 'var(--md-sys-color-surface-container-low)',
                          borderColor: 'var(--md-sys-color-outline-variant)',
                          color: 'var(--md-sys-color-on-surface-variant)',
                        }}
                        className="p-6 rounded-3xl border text-center"
                      >
                        <p className="text-xs">No tracked {watchlistType.toLowerCase()}s yet.</p>
                      </div>
                    );
                  }

                  return currentList.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: 'var(--md-sys-color-surface)',
                        borderColor: 'var(--md-sys-color-outline-variant)',
                      }}
                      className="p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate">{item.name}</div>
                        <div
                          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                          className="text-[10px]"
                        >
                          Type: {item.type}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Scan button */}
                        <button
                          type="button"
                          onClick={() => handleScanTarget(item)}
                          disabled={isScanning}
                          style={{
                            backgroundColor: 'var(--md-sys-color-surface-container)',
                            color: 'var(--md-sys-color-primary)',
                          }}
                          className="min-h-[38px] px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                          title="Scan this target now"
                        >
                          <RefreshCw className={`h-3 w-3 ${isScanning ? 'animate-spin' : ''}`} />
                          <span>Scan</span>
                        </button>

                        {/* Audible link */}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: 'var(--md-sys-color-surface-container)',
                              color: 'var(--md-sys-color-on-surface-variant)',
                            }}
                            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl transition hover:text-[var(--md-sys-color-primary)] shadow-xs"
                            title="Open on Audible"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Stop tracking ${item.name}?`)) {
                              removeWatchlistTarget(item.id);
                              showToast(`Removed ${item.name} from watchlists`, 'info');
                            }
                          }}
                          style={{
                            backgroundColor: 'var(--md-sys-color-error-container)',
                            color: 'var(--md-sys-color-error)',
                          }}
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl transition active:scale-95 cursor-pointer shadow-xs"
                          title="Delete target"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* SECTION 2: LANGUAGE FILTER PREFERENCE */}
          {activeSection === 'language' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Language Tracking Filter
                </h3>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px]"
                >
                  Select whether foreign language translations are tracked
                </p>
              </div>

              <div className="space-y-3">
                {/* Option 1: English Only */}
                <button
                  type="button"
                  onClick={() => setLanguageFilter('english_only')}
                  style={{
                    backgroundColor:
                      languageFilter === 'english_only'
                        ? 'var(--md-sys-color-primary-container)'
                        : 'var(--md-sys-color-surface)',
                    borderColor:
                      languageFilter === 'english_only'
                        ? 'var(--md-sys-color-primary)'
                        : 'var(--md-sys-color-outline-variant)',
                  }}
                  className="w-full p-4 rounded-3xl border text-left transition cursor-pointer flex items-center justify-between shadow-sm active:scale-98"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span>🇺🇸 English Audiobooks Only</span>
                    </div>
                    <p
                      style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                      className="text-xs"
                    >
                      Default mode. Excludes German, Spanish, French, and other foreign editions.
                    </p>
                  </div>
                  {languageFilter === 'english_only' && (
                    <div
                      style={{
                        backgroundColor: 'var(--md-sys-color-primary)',
                        color: 'var(--md-sys-color-on-primary)',
                      }}
                      className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 ml-2 shadow"
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* Option 2: All Languages */}
                <button
                  type="button"
                  onClick={() => setLanguageFilter('all_languages')}
                  style={{
                    backgroundColor:
                      languageFilter === 'all_languages'
                        ? 'var(--md-sys-color-primary-container)'
                        : 'var(--md-sys-color-surface)',
                    borderColor:
                      languageFilter === 'all_languages'
                        ? 'var(--md-sys-color-primary)'
                        : 'var(--md-sys-color-outline-variant)',
                  }}
                  className="w-full p-4 rounded-3xl border text-left transition cursor-pointer flex items-center justify-between shadow-sm active:scale-98"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span>🌐 All Languages (Multilingual)</span>
                    </div>
                    <p
                      style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                      className="text-xs"
                    >
                      Tracks every release regardless of language (English, German, Spanish, etc.).
                    </p>
                  </div>
                  {languageFilter === 'all_languages' && (
                    <div
                      style={{
                        backgroundColor: 'var(--md-sys-color-primary)',
                        color: 'var(--md-sys-color-on-primary)',
                      }}
                      className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 ml-2 shadow"
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: BACKUP (EXPORT & IMPORT) */}
          {activeSection === 'backup' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <ExportImportTab />
            </div>
          )}

          {/* SECTION 4: MUTE RULES */}
          {activeSection === 'mutelist' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Mute Rules (Ignore List)
                </h3>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px]"
                >
                  Filter out unwanted keywords or dramatized adaptations
                </p>
              </div>

              {/* Add Mute Rule Form */}
              <form
                onSubmit={handleAddMute}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-low)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="p-3.5 rounded-3xl border space-y-2.5 shadow-sm"
              >
                <div className="flex gap-2">
                  <select
                    value={newMuteType}
                    onChange={(e) => setNewMuteType(e.target.value as any)}
                    className="md-input min-h-[44px] px-3 text-xs font-bold rounded-2xl"
                  >
                    <option value="Series">Series</option>
                    <option value="Keyword">Keyword</option>
                    <option value="Author">Author</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Phrase to ignore (e.g. GraphicAudio)..."
                    value={newMuteValue}
                    onChange={(e) => setNewMuteValue(e.target.value)}
                    className="md-input flex-1 min-h-[44px] px-3.5 text-xs font-medium rounded-2xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMuteValue.trim()}
                  style={{
                    backgroundColor: 'var(--md-sys-color-error)',
                    color: '#ffffff',
                  }}
                  className="w-full min-h-[44px] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Mute Rule</span>
                </button>
              </form>

              {/* Mute Rules List */}
              <div className="space-y-2">
                {muteList.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      borderColor: 'var(--md-sys-color-outline-variant)',
                      color: 'var(--md-sys-color-on-surface-variant)',
                    }}
                    className="p-6 rounded-3xl border text-center"
                  >
                    <p className="text-xs">No active mute rules.</p>
                  </div>
                ) : (
                  muteList.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        backgroundColor: 'var(--md-sys-color-surface)',
                        borderColor: 'var(--md-sys-color-outline-variant)',
                      }}
                      className="p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs shadow-xs"
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
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl transition cursor-pointer active:scale-95 shadow-xs"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with large Settings & Done buttons */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="p-3.5 border-t flex items-center gap-2.5 shrink-0"
        >
          <button
            onClick={() => {
              onClose();
              onOpenSettingsModal();
            }}
            className="md-btn-tonal flex-1 min-h-[46px] rounded-2xl text-xs font-bold gap-2 shadow-xs"
          >
            <Sliders className="h-4 w-4" style={{ color: 'var(--md-sys-color-primary)' }} />
            <span>Preferences &amp; Displays</span>
          </button>

          <button
            onClick={onClose}
            className="md-btn-fab min-h-[46px] px-6 rounded-2xl text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
