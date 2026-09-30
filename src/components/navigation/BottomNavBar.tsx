import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { AppTab } from '../../types/audiobook';
import { Home, Compass, Calendar, Bookmark, Settings } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useTracker();

  const tabs: Array<{ id: AppTab; label: string; icon: React.ElementType }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--md-sys-color-outline-variant)',
        boxShadow: 'var(--md-elevation-3)',
      }}
      className="fixed bottom-0 inset-x-0 z-40 border-t pb-safe select-none transition-colors duration-200"
      aria-label="Main Navigation"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl cursor-pointer ${
                isActive
                  ? 'text-[var(--md-sys-color-primary)] font-bold'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <div
                style={{
                  backgroundColor: isActive ? 'var(--md-sys-color-primary-container)' : 'transparent',
                }}
                className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
                  isActive ? 'scale-105' : ''
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`}
                  style={{
                    color: isActive ? 'var(--md-sys-color-on-primary-container)' : 'inherit',
                  }}
                />
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
