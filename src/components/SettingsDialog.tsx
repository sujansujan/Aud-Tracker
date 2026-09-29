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
    setViewMode,
    watchlists,
    addWatchlistTarget,
    removeWatchlistTarget,
    muteList,
    addMuteRule,
    removeMuteRule,
    pushSettings,
    updatePushSettings,
    requestSystemNotificationPermission,
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

  const viewModes: Array<{
    id: 'table' | 'grid' | 'compact_grid' | 'list';
    label: string;
    desc: string;
    icon: React.ElementType;
  }> = [
    {
      id: 'table',
      label: 'Table View (Dense)',
      desc: 'Tabular grid with sortable columns and status tracking.',
      icon: Table,
    },
    {
      id: 'grid',
      label: 'Standard Grid',
      desc: 'Spacious cover art cards with release badges and synopsis.',
      icon: LayoutGrid,
    },
    {
      id: 'compact_grid',
      label: 'Compact Grid (Mobile)',
      desc: 'Dense poster view optimized for browsing maximum books on phones.',
      icon: Grid3X3,
    },
    {
      id: 'list',
      label: 'Expanded List',
      desc: 'Single-column detail cards with audio sample controls.',
      icon: List,
    },
  ];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-white">Settings &amp; Preferences</h3>
              <p className="text-[11px] text-slate-400">Library defaults, backup export/import, and rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-2.5 border-b border-slate-800 overflow-x-auto shrink-0 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'preferences'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('export_import')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'export_import'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDriveDownload className="h-3.5 w-3.5" />
            <span>Export &amp; Import</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlists')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'watchlists'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Watchlists ({watchlists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mutelist')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'mutelist'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <VolumeX className="h-3.5 w-3.5" />
            <span>Mute Rules ({muteList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'notifications'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Alerts</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-5">
              {/* Default View Layout */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Default View Layout
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewModes.map((vm) => {
                    const Icon = vm.icon;
                    const isSelected = preferences.defaultViewMode === vm.id;
                    return (
                      <button
                        key={vm.id}
                        type="button"
                        onClick={() => {
                          updatePreferences({ defaultViewMode: vm.id });
                          setViewMode(vm.id);
                        }}
                        className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                            <span>{vm.label}</span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{vm.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default Search Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Default Add / Search Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {searchModes.map((sm) => {
                    const Icon = sm.icon;
                    const isSelected = preferences.defaultSearchMode === sm.id;
                    return (
                      <button
                        key={sm.id}
                        type="button"
                        onClick={() => updatePreferences({ defaultSearchMode: sm.id })}
                        className={`p-2.5 rounded-xl text-left border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                          <div className="truncate">
                            <div className="text-xs font-bold truncate">{sm.label}</div>
                            <div className="text-[10px] text-slate-500 truncate">{sm.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default Startup View Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Tracked Watchlists
                </h4>
                <p className="text-[11px] text-slate-400">
                  Authors, Series, and Narrators monitored for upcoming audiobook releases
                </p>
              </div>

              {/* Add Watchlist Form */}
              <form onSubmit={handleAddWatchlist} className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={wlType}
                    onChange={(e) => setWlType(e.target.value as any)}
                    className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200"
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
                    className="sm:col-span-2 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Optional Audible URL or search keyword"
                    value={wlUrl}
                    onChange={(e) => setWlUrl(e.target.value)}
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Watchlist Items List */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {watchlists.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No watchlists configured.</p>
                ) : (
                  watchlists.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            w.type === 'Series'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : w.type === 'Author'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {w.type}
                        </span>
                        <span className="font-semibold text-slate-200 truncate">{w.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {w.url && (
                          <a
                            href={w.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-amber-400 transition"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => removeWatchlistTarget(w.id)}
                          className="text-slate-500 hover:text-rose-400 transition p-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Mute Rules (Ignore List)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Filter out spin-offs, non-English editions, or dramatized adaptations
                </p>
              </div>

              {/* Add Mute Rule Form */}
              <form onSubmit={handleAddMute} className="flex gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <select
                  value={muteType}
                  onChange={(e) => setMuteType(e.target.value as any)}
                  className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 shrink-0"
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
                  className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Mute</span>
                </button>
              </form>

              {/* Mute Items List */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {muteList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No mute rules configured.</p>
                ) : (
                  muteList.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
                          {m.type}
                        </span>
                        <span className="font-semibold text-slate-200 truncate">{m.value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMuteRule(m.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1 cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Release Alerts &amp; Notifications
                </h4>
                <p className="text-[11px] text-slate-400">
                  Configure browser and native push notifications for upcoming release dates
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">System Push Notifications</span>
                    <span className="text-[10px] text-slate-400">Receive alerts when app is in the background</span>
                  </div>
                  <button
                    type="button"
                    onClick={requestSystemNotificationPermission}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                      pushSettings.pushEnabled
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-amber-500 text-slate-950 font-bold'
                    }`}
                  >
                    {pushSettings.pushEnabled ? 'Enabled' : 'Enable Notifications'}
                  </button>
                </div>

                <div className="h-px bg-slate-800" />

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Default Reminder Intervals</span>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushSettings.notifyOneWeek}
                      onChange={(e) => updatePushSettings({ notifyOneWeek: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>7 Days Before Release</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushSettings.notifyOneDay}
                      onChange={(e) => updatePushSettings({ notifyOneDay: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>24 Hours Before Release</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushSettings.notifyDayOf}
                      onChange={(e) => updatePushSettings({ notifyDayOf: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Day of Release Morning Alert</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushSettings.soundEnabled}
                      onChange={(e) => updatePushSettings({ soundEnabled: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Play Audio Chime on Alert</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
