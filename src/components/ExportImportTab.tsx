import React, { useState, useRef } from 'react';
import { useTracker } from '../context/TrackerContext';
import { validateImportJson, createBackupJson } from '../utils/exportImport';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const ExportImportTab: React.FC = () => {
  const {
    books,
    watchlists,
    muteList,
    preferences,
    pushSettings,
    exportBackup,
    importBackup,
    showToast,
    resetToDefaults,
  } = useTracker();

  const [copied, setCopied] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    data?: any;
    summary?: { booksCount: number; watchlistsCount: number; muteRulesCount: number };
    error?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Copy to Clipboard
  const handleCopyJson = () => {
    const jsonStr = createBackupJson(books, watchlists, muteList, preferences, pushSettings);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    showToast('Backup JSON copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  // Inspect file on upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawJsonInput(text);
        const result = validateImportJson(text);
        setValidationResult(result);
      }
    };
    reader.readAsText(file);
  };

  // Inspect typed/pasted JSON
  const handleInspectPastedText = (text: string) => {
    setRawJsonInput(text);
    if (!text.trim()) {
      setValidationResult(null);
      return;
    }
    const result = validateImportJson(text);
    setValidationResult(result);
  };

  // Apply the validated import
  const handleExecuteImport = () => {
    if (!validationResult || !validationResult.valid || !validationResult.data) {
      showToast('Please provide a valid backup JSON first.', 'error');
      return;
    }

    if (
      importMode === 'replace' &&
      !window.confirm(
        'Warning: Replace mode will overwrite your current books and watchlists with the imported backup. Do you want to continue?'
      )
    ) {
      return;
    }

    importBackup(validationResult.data, importMode);
    setRawJsonInput('');
    setValidationResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset to default sample catalog
  const handleResetCatalog = () => {
    if (
      window.confirm(
        'Are you sure you want to reset the catalog to the initial sample library? Any un-exported custom books will be removed.'
      )
    ) {
      resetToDefaults();
      showToast('Library reset to default catalog.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Export Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4
              style={{ color: 'var(--md-sys-color-primary)' }}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Export &amp; Backup
            </h4>
            <p
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              className="text-[11px]"
            >
              Save your library, watchlists, reading history, and mute filters
            </p>
          </div>
          <span
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs font-semibold tabular-nums"
          >
            {books.length} books tracked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* JSON Full Backup */}
          <button
            onClick={() => exportBackup('json')}
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="flex flex-col items-center justify-center p-4 rounded-3xl border hover:border-[var(--md-sys-color-primary)] transition cursor-pointer group text-center shadow-xs active:scale-95"
          >
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
              }}
              className="h-10 w-10 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs"
            >
              <FileJson className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold mb-0.5">Backup JSON</span>
            <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-[10px]">
              Complete library snapshot
            </span>
          </button>

          {/* CSV Spreadsheet */}
          <button
            onClick={() => exportBackup('csv')}
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="flex flex-col items-center justify-center p-4 rounded-3xl border hover:border-[var(--md-sys-color-accent-green)] transition cursor-pointer group text-center shadow-xs active:scale-95"
          >
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-accent-green-container)',
                color: 'var(--md-sys-color-accent-green)',
              }}
              className="h-10 w-10 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold mb-0.5">Export CSV</span>
            <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-[10px]">
              For Excel &amp; Spreadsheets
            </span>
          </button>

          {/* Copy JSON */}
          <button
            onClick={handleCopyJson}
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="flex flex-col items-center justify-center p-4 rounded-3xl border hover:border-[var(--md-sys-color-secondary)] transition cursor-pointer group text-center shadow-xs active:scale-95"
          >
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-secondary)',
              }}
              className="h-10 w-10 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs"
            >
              {copied ? <Check className="h-5 w-5 stroke-[2.5]" /> : <Copy className="h-5 w-5" />}
            </div>
            <span className="text-xs font-bold mb-0.5">
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </span>
            <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-[10px]">
              Raw JSON text copy
            </span>
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }} className="h-px" />

      {/* 2. Import Section */}
      <div className="space-y-4">
        <div>
          <h4
            style={{ color: 'var(--md-sys-color-primary)' }}
            className="text-xs font-bold uppercase tracking-wider"
          >
            Import &amp; Restore
          </h4>
          <p
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-[11px]"
          >
            Restore from a previous backup file or paste a JSON string
          </p>
        </div>

        {/* Import Mode Selector: Merge vs Replace */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center gap-2 p-1.5 rounded-2xl border"
        >
          <button
            type="button"
            onClick={() => setImportMode('merge')}
            style={{
              backgroundColor: importMode === 'merge' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: importMode === 'merge' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <Layers className="h-4 w-4" />
            <span>Merge with Current</span>
          </button>

          <button
            type="button"
            onClick={() => setImportMode('replace')}
            style={{
              backgroundColor: importMode === 'replace' ? 'var(--md-sys-color-error)' : 'transparent',
              color: importMode === 'replace' ? '#ffffff' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Replace / Overwrite</span>
          </button>
        </div>

        <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-xs italic">
          {importMode === 'merge'
            ? '• Merge: Preserves your downloaded/listened states and adds any new books or watchlists.'
            : '• Replace: Erases the current database and restores exactly what is stored inside the backup file.'}
        </p>

        {/* File Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline)',
          }}
          className="p-6 rounded-3xl border-2 border-dashed hover:border-[var(--md-sys-color-primary)] transition flex flex-col items-center justify-center text-center cursor-pointer group shadow-xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-primary)',
            }}
            className="h-12 w-12 rounded-2xl flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-xs"
          >
            <Upload className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">Choose Backup File (.json)</span>
          <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-[11px] mt-0.5">
            Click or drag &amp; drop file here
          </span>
        </div>

        {/* Toggle Paste Box */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowPasteBox(!showPasteBox)}
            style={{ color: 'var(--md-sys-color-primary)' }}
            className="text-xs font-bold cursor-pointer underline"
          >
            {showPasteBox ? 'Hide Paste Box' : 'Or Paste Raw JSON String'}
          </button>
        </div>

        {showPasteBox && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <textarea
              value={rawJsonInput}
              onChange={(e) => handleInspectPastedText(e.target.value)}
              placeholder="Paste backup JSON string here..."
              rows={4}
              className="md-input w-full p-3 text-xs font-mono rounded-2xl"
            />
          </div>
        )}

        {/* Validation Result Box */}
        {validationResult && (
          <div
            style={{
              backgroundColor: validationResult.valid
                ? 'var(--md-sys-color-accent-green-container)'
                : 'var(--md-sys-color-error-container)',
              borderColor: validationResult.valid
                ? 'var(--md-sys-color-accent-green)'
                : 'var(--md-sys-color-error)',
              color: validationResult.valid
                ? 'var(--md-sys-color-accent-green)'
                : 'var(--md-sys-color-error)',
            }}
            className="p-4 rounded-3xl border text-xs shadow-sm space-y-2.5"
          >
            {validationResult.valid ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Valid Backup Detected</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-black/10">
                    <strong>{validationResult.summary?.booksCount}</strong> Audiobooks
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/10">
                    <strong>{validationResult.summary?.watchlistsCount}</strong> Watchlists
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/10">
                    <strong>{validationResult.summary?.muteRulesCount}</strong> Mute Rules
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  style={{
                    backgroundColor: 'var(--md-sys-color-accent-green)',
                    color: '#ffffff',
                  }}
                  className="w-full py-2.5 rounded-2xl font-bold text-xs shadow-md transition cursor-pointer active:scale-98 mt-2"
                >
                  Confirm &amp; Import Now ({importMode === 'merge' ? 'Merge' : 'Replace'})
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{validationResult.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }} className="h-px" />

      {/* 3. Reset Option */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-bold">Reset Library</span>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-[11px]">
            Restore default sample catalog
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetCatalog}
          style={{
            borderColor: 'var(--md-sys-color-outline-variant)',
            color: 'var(--md-sys-color-error)',
          }}
          className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition hover:bg-[var(--md-sys-color-error-container)] cursor-pointer"
        >
          Reset to Factory
        </button>
      </div>
    </div>
  );
};
