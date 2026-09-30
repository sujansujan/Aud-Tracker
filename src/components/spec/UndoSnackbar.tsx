import React from 'react';
import { useSpecTracker } from '../../context/SpecTrackerContext';

export const UndoSnackbar: React.FC = () => {
  const { snackbar, dismissSnackbar } = useSpecTracker();

  if (!snackbar) return null;

  return (
    <div className="fixed bottom-16 inset-x-4 z-50 max-w-sm mx-auto animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-on-surface)] text-[var(--md-sys-color-surface)] shadow-lg text-xs">
        <span className="truncate mr-3">{snackbar.message}</span>
        <button
          type="button"
          onClick={() => {
            snackbar.onUndo();
            dismissSnackbar();
          }}
          className="text-[var(--md-sys-color-accent-amber)] font-medium uppercase tracking-wider hover:underline shrink-0 cursor-pointer"
        >
          Undo
        </button>
      </div>
    </div>
  );
};
