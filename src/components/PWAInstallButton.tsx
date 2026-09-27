import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          aria-label="Install Android App"
          className={
            compact
              ? "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              : "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/15 cursor-pointer whitespace-nowrap"
          }
        >
          {installSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-slate-950" />
              <span>Installed!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>Install App</span>
            </>
          )}
        </button>
      </>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install on iOS"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white">Install AudioTracker</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-amber-400">1</span>
                  <p>Tap the <strong className="text-white inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5 inline text-amber-400" /> Share</strong> button in your Safari navigation bar.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-amber-400">2</span>
                  <p>Scroll down and select <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline text-amber-400" /> Add to Home Screen</strong>.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback install guide button for other browsers / environments
  return (
    <button
      onClick={() => alert("To install this app on your device, use your browser's menu (⋮ or Share) and select 'Install app' or 'Add to Home screen'.")}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
      title="Install as Progressive Web App"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span>Install PWA</span>
    </button>
  );
};
