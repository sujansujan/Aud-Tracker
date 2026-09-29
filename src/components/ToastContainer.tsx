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
            style={{
              backgroundColor: isSuccess
                ? 'var(--md-sys-color-accent-green-container)'
                : isError
                ? 'var(--md-sys-color-error-container)'
                : 'var(--md-sys-color-surface)',
              borderColor: isSuccess
                ? 'var(--md-sys-color-accent-green)'
                : isError
                ? 'var(--md-sys-color-error)'
                : 'var(--md-sys-color-primary)',
              color: isSuccess
                ? 'var(--md-sys-color-accent-green)'
                : isError
                ? 'var(--md-sys-color-error)'
                : 'var(--md-sys-color-on-surface)',
              boxShadow: 'var(--md-elevation-3)',
            }}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs font-bold transition-all duration-200 animate-in slide-in-from-bottom-2 fade-in shadow-xl"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {isError && <AlertCircle className="h-4 w-4 shrink-0" />}
              {!isSuccess && !isError && (
                <Info className="h-4 w-4 shrink-0" style={{ color: 'var(--md-sys-color-primary)' }} />
              )}
              <span className="truncate">{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:opacity-70 transition cursor-pointer shrink-0 ml-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
