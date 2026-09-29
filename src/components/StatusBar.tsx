import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { PWAInstallButton } from './PWAInstallButton';
import { Bell, Settings, Radio } from 'lucide-react';

interface StatusBarProps {
  onOpenNotifications: () => void;
  onOpenPreferences?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ onOpenNotifications, onOpenPreferences }) => {
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
    <footer
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--md-sys-color-outline-variant)',
        color: 'var(--md-sys-color-on-surface-variant)',
      }}
      className="min-h-10 pb-safe pt-2 border-t px-3 sm:px-5 flex items-center justify-between text-xs select-none shrink-0 z-10 transition-colors duration-200"
    >
      {/* Left: Material Status Indicator */}
      <div className="flex items-center gap-2 truncate text-[11px] sm:text-xs">
        {isScanning ? (
          <span
            style={{ color: 'var(--md-sys-color-primary)' }}
            className="flex items-center gap-2 font-bold truncate animate-pulse"
          >
            <Radio className="h-4 w-4 animate-spin" />
            <span>{scanStatusText}</span>
          </span>
        ) : (
          <div className="flex items-center gap-2 truncate">
            <span
              style={{
                backgroundColor: 'var(--md-sys-color-accent-green)',
              }}
              className="h-2 w-2 rounded-full inline-block shrink-0 shadow-xs"
            />
            <span className="truncate">
              <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>Tracked:</strong> {books.length} audiobooks{' '}
              <span className="opacity-40">|</span> <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>Watchlists:</strong> {watchlists.length}{' '}
              <span className="opacity-40">|</span> <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>Last Checked:</strong> {lastCheckedTime || 'Just now'}
            </span>
          </div>
        )}
      </div>

      {/* Right: Shortcuts & Notification Bell */}
      <div className="flex items-center gap-2 shrink-0">
        <PWAInstallButton compact />

        {onOpenPreferences && (
          <button
            onClick={onOpenPreferences}
            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition cursor-pointer"
            title="App & Default Preferences"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition cursor-pointer"
          title="Release notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-extrabold shadow"
            >
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>
    </footer>
  );
};
