import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Headphones, Bell, Plus, Sparkles, BookOpen } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopHeaderProps {
  onOpenAddModal: () => void;
  onOpenNotifications: () => void;
  activeTab: 'upcoming' | 'tracked' | 'read' | 'alerts';
  setActiveTab: (tab: 'upcoming' | 'tracked' | 'read' | 'alerts') => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenAddModal,
  onOpenNotifications,
  activeTab,
  setActiveTab,
}) => {
  const { unreadNotifCount } = useTracker();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Zone 1: Single text wordmark brand with icon */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-md shadow-amber-500/20 text-slate-950">
            <Headphones className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            AudioTracker
          </span>
          <span className="hidden text-xs text-amber-400/80 font-medium sm:inline">
            Audible Releases
          </span>
        </div>

        {/* Zone 2: Navigation links for desktop / tablet */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Upcoming Releases
          </button>
          <button
            onClick={() => setActiveTab('tracked')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'tracked'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Tracked Creators & Series
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'read'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Reading History
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Release Alerts
          </button>
        </nav>

        {/* Zone 3: Actions (Install PWA, Add Book/Entity, Notification Bell) */}
        <div className="flex items-center gap-2">
          <PWAInstallButton compact />

          <button
            onClick={onOpenNotifications}
            aria-label="Release Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-slate-950 shadow-sm animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-amber-500 px-3 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition shadow-sm shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Track New</span>
          </button>
        </div>

      </div>
    </header>
  );
};
