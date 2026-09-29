import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { DownloadCloud, CheckCircle, Trash2, X, FileSpreadsheet } from 'lucide-react';
import { exportToCsv } from '../utils/exportImport';

interface FloatingBatchBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export const FloatingBatchBar: React.FC<FloatingBatchBarProps> = ({
  selectedIds,
  onClearSelection,
}) => {
  const { books, toggleField, deleteMultipleBooks, showToast } = useTracker();

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;

  const handleToggleDownloaded = () => {
    selectedIds.forEach((id) => toggleField(id, 'downloaded'));
    showToast(`Toggled Downloaded for ${count} books`, 'info');
  };

  const handleToggleListened = () => {
    selectedIds.forEach((id) => toggleField(id, 'listened'));
    showToast(`Toggled Listened for ${count} books`, 'info');
  };

  const handleExportSelected = () => {
    const selectedBooks = books.filter((b) => selectedIds.includes(b.id));
    exportToCsv(selectedBooks);
    showToast(`Exported ${count} selected books to CSV`, 'success');
  };

  const handleDelete = () => {
    const msg =
      count === 1
        ? 'Are you sure you want to delete this selected book?'
        : `Are you sure you want to delete all ${count} selected books?`;
    if (window.confirm(msg)) {
      deleteMultipleBooks(selectedIds);
      onClearSelection();
      showToast(`Removed ${count} books from library`, 'info');
    }
  };

  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-slate-900/95 border border-amber-500/50 shadow-2xl backdrop-blur-md text-xs font-semibold animate-in slide-in-from-bottom-3 fade-in duration-150">
      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0">
        {count} selected
      </span>

      <div className="h-4 w-px bg-slate-800" />

      {/* Action: Downloaded */}
      <button
        onClick={handleToggleDownloaded}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer"
        title="Toggle Downloaded"
      >
        <DownloadCloud className="h-3.5 w-3.5 text-sky-400" />
        <span className="hidden sm:inline">Downloaded</span>
      </button>

      {/* Action: Listened */}
      <button
        onClick={handleToggleListened}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer"
        title="Toggle Listened / Read"
      >
        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Listened</span>
      </button>

      {/* Action: Export CSV */}
      <button
        onClick={handleExportSelected}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer"
        title="Export selected books to CSV"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-amber-400" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Action: Delete */}
      <button
        onClick={handleDelete}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-rose-100 transition cursor-pointer"
        title="Delete Selected"
      >
        <Trash2 className="h-3.5 w-3.5 text-rose-400" />
        <span className="hidden sm:inline">Delete</span>
      </button>

      <div className="h-4 w-px bg-slate-800" />

      {/* Clear selection */}
      <button
        onClick={onClearSelection}
        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        title="Clear selection"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
