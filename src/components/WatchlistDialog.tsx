import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { WatchlistItem } from '../types/audiobook';
import { X, Plus, Trash2, Search, ExternalLink, Sparkles, Check } from 'lucide-react';

interface WatchlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WatchlistDialog: React.FC<WatchlistDialogProps> = ({ isOpen, onClose }) => {
  const { watchlists, addWatchlistTarget, removeWatchlistTarget, scanSingleTarget, isScanning } = useTracker();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<'Author' | 'Series' | 'Narrator'>('Author');
  const [targetName, setTargetName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) {
      alert('Please enter a Name.');
      return;
    }

    addWatchlistTarget({
      type: targetType,
      name: targetName.trim(),
      url: targetUrl.trim(),
    });

    setStatusMsg(`Added ${targetName} to ${targetType} Watchlist.`);
    setTargetName('');
    setTargetUrl('');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleRemove = () => {
    if (!selectedId) {
      alert('Please select a target to remove.');
      return;
    }
    removeWatchlistTarget(selectedId);
    setSelectedId(null);
  };

  const handleScanSelected = async () => {
    if (!selectedId) {
      alert('Please select a target to scan.');
      return;
    }
    const item = watchlists.find((w) => w.id === selectedId);
    if (!item) return;

    setStatusMsg(`Scanning ${item.name}...`);
    const count = await scanSingleTarget(item);
    setStatusMsg(`Imported ${count} upcoming English release(s) for ${item.name}!`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <span>Manage Watchlists (Authors, Series, Narrators)</span>
            </h3>
            <p className="text-xs text-slate-400">Tracked Targets (Monitored for all upcoming English releases):</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Watchlist Table */}
        <div className="flex-1 overflow-y-auto max-h-56 border border-slate-800 rounded-xl bg-slate-950">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-900 text-slate-400 text-[11px] font-bold border-b border-slate-800 uppercase">
              <tr>
                <th className="p-2.5 w-24">Type</th>
                <th className="p-2.5">Name / Target</th>
                <th className="p-2.5">Audible URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {watchlists.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-800 text-white font-medium border-l-2 border-l-amber-500'
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <td className="p-2.5 font-bold text-amber-400">{item.type}</td>
                    <td className="p-2.5 font-semibold text-slate-100 truncate max-w-xs">{item.name}</td>
                    <td className="p-2.5 text-slate-400 truncate max-w-xs font-mono text-[11px]">{item.url}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* GroupBox: Add New Target */}
        <form onSubmit={handleAdd} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shrink-0">
          <span className="text-xs font-bold text-slate-300 block">Add New Target to Watchlist</span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Type:</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full h-8.5 rounded-lg bg-slate-900 border border-slate-800 px-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Author">Author</option>
                <option value="Series">Series</option>
                <option value="Narrator">Narrator</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Name:</label>
              <input
                type="text"
                required
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Brandon Sanderson or Dungeon Crawler Carl"
                className="w-full h-8.5 rounded-lg bg-slate-900 border border-slate-800 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">URL:</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://www.audible.com/author/... (Optional)"
              className="w-full h-8.5 rounded-lg bg-slate-900 border border-slate-800 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              (Tip: Leave URL blank to auto-generate a search query for this name)
            </p>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Target</span>
            </button>

            {statusMsg && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>{statusMsg}</span>
              </span>
            )}
          </div>
        </form>

        {/* Dialog Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRemove}
              disabled={!selectedId}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
            >
              ❌ Remove Selected
            </button>

            <button
              type="button"
              onClick={handleScanSelected}
              disabled={!selectedId || isScanning}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-40 cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-amber-400" />
              <span>Scan Selected Now</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
