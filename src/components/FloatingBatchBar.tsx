import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { DownloadCloud, CheckCircle, Trash2, X, FileSpreadsheet, CheckSquare } from 'lucide-react';
import { exportToCsv } from '../utils/exportImport';

interface FloatingBatchBarProps {
  selectedIds: string[];
  totalFilteredCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
}

export const FloatingBatchBar: React.FC<FloatingBatchBarProps> = ({
  selectedIds,
  totalFilteredCount,
  onClearSelection,
  onSelectAll,
}) => {
  const { books, toggleField, deleteMultipleBooks, showToast } = useTracker();

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;
  const isAllSelected = count >= totalFilteredCount;

  const handleToggleDownloaded = () => {
    selectedIds.forEach((id) => toggleField(id, 'downloaded'));
    showToast(`Marked ${count} books as Downloaded`, 'info');
  };

  const handleToggleListened = () => {
    selectedIds.forEach((id) => toggleField(id, 'listened'));
    showToast(`Marked ${count} books as Listened / Read`, 'info');
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
    <div
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--md-sys-color-primary)',
        boxShadow: 'var(--md-elevation-3)',
      }}
      className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-2 p-2 px-3 rounded-full border-2 text-xs font-semibold animate-in slide-in-from-bottom-4 fade-in duration-200 max-w-[95vw]"
    >
      {/* Count Badge / Toggle All */}
      <button
        onClick={isAllSelected ? onClearSelection : onSelectAll}
        style={{
          backgroundColor: 'var(--md-sys-color-primary)',
          color: 'var(--md-sys-color-on-primary)',
        }}
        className="min-h-[42px] px-3.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95 shrink-0"
        title={isAllSelected ? 'Deselect all audiobooks' : 'Select all audiobooks'}
      >
        <CheckSquare className="h-4 w-4 stroke-[2.5]" />
        <span>{count} Selected {isAllSelected ? '(All)' : ''}</span>
      </button>

      <div
        style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }}
        className="hidden sm:block h-6 w-px"
      />

      {/* Action: Downloaded */}
      <button
        onClick={handleToggleDownloaded}
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container)',
          color: 'var(--md-sys-color-on-surface)',
        }}
        className="min-h-[42px] px-3 rounded-full active:scale-95 hover:bg-[var(--md-sys-color-surface-container-high)] transition cursor-pointer flex items-center gap-1.5 shrink-0"
        title="Toggle Downloaded for all selected"
      >
        <DownloadCloud className="h-4 w-4" style={{ color: 'var(--md-sys-color-secondary)' }} />
        <span className="hidden xs:inline">Downloaded</span>
      </button>

      {/* Action: Listened */}
      <button
        onClick={handleToggleListened}
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container)',
          color: 'var(--md-sys-color-on-surface)',
        }}
        className="min-h-[42px] px-3 rounded-full active:scale-95 hover:bg-[var(--md-sys-color-surface-container-high)] transition cursor-pointer flex items-center gap-1.5 shrink-0"
        title="Toggle Listened for all selected"
      >
        <CheckCircle className="h-4 w-4" style={{ color: 'var(--md-sys-color-accent-green)' }} />
        <span className="hidden xs:inline">Listened</span>
      </button>

      {/* Action: Export CSV */}
      <button
        onClick={handleExportSelected}
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container)',
          color: 'var(--md-sys-color-on-surface)',
        }}
        className="min-h-[42px] px-3 rounded-full active:scale-95 hover:bg-[var(--md-sys-color-surface-container-high)] transition cursor-pointer flex items-center gap-1.5 shrink-0"
        title="Export selected books to CSV"
      >
        <FileSpreadsheet className="h-4 w-4" style={{ color: 'var(--md-sys-color-accent-yellow)' }} />
        <span className="hidden sm:inline">Export CSV</span>
      </button>

      {/* Action: Delete */}
      <button
        onClick={handleDelete}
        style={{
          backgroundColor: 'var(--md-sys-color-error-container)',
          color: 'var(--md-sys-color-error)',
        }}
        className="min-h-[42px] px-3 rounded-full active:scale-95 transition cursor-pointer flex items-center gap-1.5 shrink-0 font-bold"
        title="Delete Selected"
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Delete</span>
      </button>

      <div
        style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }}
        className="h-6 w-px"
      />

      {/* Clear selection */}
      <button
        onClick={onClearSelection}
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}
        className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] transition cursor-pointer shrink-0"
        title="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
