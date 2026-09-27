import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { PWAInstallButton } from './PWAInstallButton';
import { Bell, Sparkles } from 'lucide-react';

interface StatusBarProps {
  onOpenNotifications: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ onOpenNotifications }) => {
  const {
    books,
    watchlists,
    muteList,
    lastCheckedTime,
    isScanning,
    scanStatusText,
    unreadNotifCount,
  } = useTracker();

  return (
    <footer className="h-9 bg-slate-900 border-t border-slate-800 px-3 sm:px-4 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0">
      
      {/* Left: AHK Status String */}
      <div className="flex items-center gap-2 truncate">
        {isScanning ? (
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold truncate animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>{scanStatusText}</span>
          </span>
        ) : (
          <span className="truncate">
            <strong className="text-slate-200">Tracked:</strong> {books.length} books{' '}
            <span className="text-slate-600">|</span> <strong className="text-slate-200">Watched:</strong> {watchlists.length}{' '}
            <span className="text-slate-600">|</span> <strong className="text-slate-200">Muted Rules:</strong> {muteList.length}{' '}
            <span className="text-slate-600">|</span> <strong className="text-slate-200">Last Check:</strong> {lastCheckedTime || 'Just now'}
          </span>
        )}
      </div>

      {/* Right: Quick shortcuts */}
      <div className="flex items-center gap-3 shrink-0">
        <PWAInstallButton compact />

        <button
          onClick={onOpenNotifications}
          className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
          title="Release notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          {unreadNotifCount > 0 && (
            <span className="flex h-4 min-w-[14px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-slate-950">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

    </footer>
  );
};
