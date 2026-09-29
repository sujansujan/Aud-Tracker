import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTracker();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-2 fade-in ${
              isSuccess
                ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
                : isError
                ? 'bg-rose-950/95 border-rose-500/60 text-rose-200'
                : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
              {isError && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
              {!isSuccess && !isError && <Info className="h-4 w-4 text-amber-400 shrink-0" />}
              <span className="truncate">{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer shrink-0 ml-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
