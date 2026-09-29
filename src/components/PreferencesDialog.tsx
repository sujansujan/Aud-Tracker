import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { X, Settings, Table, LayoutGrid, Grid3X3, List, BookOpen, Layers, User, Mic, Filter, Check } from 'lucide-react';

interface PreferencesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesDialog: React.FC<PreferencesDialogProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, setViewMode, setViewFilter } = useTracker();

  if (!isOpen) return null;

  const viewModes: Array<{
    id: 'table' | 'grid' | 'compact_grid' | 'list';
    label: string;
    desc: string;
    icon: React.ElementType;
  }> = [
    {
      id: 'table',
      label: 'Table View (AHK Desktop)',
      desc: 'Dense tabular grid with sortable columns, downloaded/listened toggles, and AHK status tracking.',
      icon: Table,
    },
    {
      id: 'grid',
      label: 'Standard Grid',
      desc: 'Spacious cover art cards with release badges and synopsis previews.',
      icon: LayoutGrid,
    },
    {
      id: 'compact_grid',
      label: 'Compact Grid',
      desc: 'Dense poster view optimized for browsing maximum books on mobile screens.',
      icon: Grid3X3,
    },
    {
      id: 'list',
      label: 'Expanded List',
      desc: 'Single-column detail cards with quick action buttons and audio player controls.',
      icon: List,
    },
  ];

  const searchModes: Array<{
    id: 'Title' | 'Series' | 'Author' | 'Narrator';
    label: string;
    desc: string;
    icon: React.ElementType;
  }> = [
    { id: 'Title', label: 'Audiobook Title / ASIN', desc: 'Direct single-book query', icon: BookOpen },
    { id: 'Series', label: 'Series Universe', desc: 'Auto-scan entire series catalog & upcoming sequels', icon: Layers },
    { id: 'Author', label: 'Author Watchlist', desc: 'Auto-scan author’s upcoming English releases', icon: User },
    { id: 'Narrator', label: 'Narrator Watchlist', desc: 'Auto-scan narrator’s upcoming voice performances', icon: Mic },
  ];

  const viewFilters: Array<{
    id: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened';
    label: string;
  }> = [
    { id: 'all', label: 'All Releases' },
    { id: 'upcoming', label: 'Upcoming Only' },
    { id: 'today', label: 'Releasing Today' },
    { id: 'downloaded', label: 'Downloaded' },
    { id: 'listened', label: 'Listened' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-white">Default Preferences</h3>
              <p className="text-[11px] text-slate-400">Configure default search mode, view layout, and startup filters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section 1: Default View Type */}
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

        {/* Section 2: Default Search & Add Target Mode */}
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

        {/* Section 3: Default Filter on Launch */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Default Startup Filter
          </label>
          <div className="flex flex-wrap gap-1.5">
            {viewFilters.map((vf) => {
              const isSelected = preferences.defaultViewFilter === vf.id;
              return (
                <button
                  key={vf.id}
                  type="button"
                  onClick={() => {
                    updatePreferences({ defaultViewFilter: vf.id });
                    setViewFilter(vf.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {vf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Device Safe Area & Screen Info */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300 flex items-center justify-between">
            <span>Mobile Device Optimization:</span>
            <span className="text-amber-400 font-mono text-[10px]">Poco X8 Pro Max Compatible</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Hardware notch and gesture navigation bar insets are actively guarded. The UI dynamically pads safe-area boundaries to prevent overlap with the system toolbar and status bar.
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
