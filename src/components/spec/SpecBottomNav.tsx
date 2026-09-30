import React from 'react';
import { useSpecTracker } from '../../context/SpecTrackerContext';
import { MainNavTab } from '../../types/specModels';
import { Clock, Search, Bookmark, Settings } from 'lucide-react';

export const SpecBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useSpecTracker();

  const tabs: Array<{ id: MainNavTab; label: string; icon: React.ElementType }> = [
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'following', label: 'Following', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--md-sys-color-outline)',
      }}
      className="fixed bottom-0 inset-x-0 z-40 border-t pb-safe select-none transition-colors"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
                isActive
                  ? 'text-[var(--md-sys-color-primary)] font-medium'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
