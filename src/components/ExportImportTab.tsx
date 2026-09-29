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
    // Clear inputs
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Export &amp; Backup
            </h4>
            <p className="text-[11px] text-slate-400">
              Save your library, watchlists, reading history, and mute filters
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {books.length} books tracked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* JSON Full Backup */}
          <button
            onClick={() => exportBackup('json')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer group text-center"
          >
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileJson className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-white mb-0.5">Backup JSON</span>
            <span className="text-[10px] text-slate-500">Complete database snapshot</span>
          </button>

          {/* CSV Spreadsheet */}
          <button
            onClick={() => exportBackup('csv')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group text-center"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-white mb-0.5">Export CSV</span>
            <span className="text-[10px] text-slate-500">For Excel &amp; Google Sheets</span>
          </button>

          {/* Copy JSON */}
          <button
            onClick={handleCopyJson}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 transition cursor-pointer group text-center"
          >
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </div>
            <span className="text-xs font-bold text-white mb-0.5">
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </span>
            <span className="text-[10px] text-slate-500">Instant JSON string copy</span>
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* 2. Import Section */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Import &amp; Restore
          </h4>
          <p className="text-[11px] text-slate-400">
            Restore from a previous backup file or paste a JSON string
          </p>
        </div>

        {/* Import Mode Selector: Merge vs Replace */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setImportMode('merge')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              importMode === 'merge'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Merge with Current</span>
          </button>

          <button
            type="button"
            onClick={() => setImportMode('replace')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              importMode === 'replace'
                ? 'bg-rose-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Replace / Overwrite</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 italic">
          {importMode === 'merge'
            ? '• Merge: Keeps existing books, updates existing metadata, and adds newly found books and watchlists.'
            : '• Replace: Erases the current library and restores the exact database from the backup file.'}
        </p>

        {/* File Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-950/60 hover:bg-slate-950/90 transition flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Upload className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-white">Choose Backup File (.json)</span>
          <span className="text-[11px] text-slate-400 mt-0.5">Click or drag &amp; drop file here</span>
        </div>

        {/* Toggle Paste Box */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
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
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 font-mono focus:border-amber-400 focus:outline-none"
            />
          </div>
        )}

        {/* Validation Result Box */}
        {validationResult && (
          <div
            className={`p-3 rounded-xl border text-xs ${
              validationResult.valid
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            {validationResult.valid ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Valid Backup Detected</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-emerald-900/50 border border-emerald-700/50">
                    <strong>{validationResult.summary?.booksCount}</strong> Audiobooks
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/50 border border-emerald-700/50">
                    <strong>{validationResult.summary?.watchlistsCount}</strong> Watchlists
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/50 border border-emerald-700/50">
                    <strong>{validationResult.summary?.muteRulesCount}</strong> Mute Rules
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer mt-1"
                >
                  Confirm &amp; Import Now ({importMode === 'merge' ? 'Merge' : 'Replace'})
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{validationResult.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-slate-800" />

      {/* 3. Reset Option */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-semibold text-slate-300">Reset Library</span>
          <p className="text-[10px] text-slate-500">Restore factory sample catalog</p>
        </div>
        <button
          type="button"
          onClick={handleResetCatalog}
          className="px-2.5 py-1 rounded-lg border border-slate-800 hover:border-rose-700/60 bg-slate-950 text-slate-400 hover:text-rose-400 text-[11px] font-semibold transition cursor-pointer"
        >
          Reset to Factory
        </button>
      </div>
    </div>
  );
};
