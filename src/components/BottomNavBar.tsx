import React from 'react';
import { Calendar, UserCheck, CheckCircle2, BellRing } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

interface BottomNavBarProps {
  activeTab: 'upcoming' | 'tracked' | 'read' | 'alerts';
  setActiveTab: (tab: 'upcoming' | 'tracked' | 'read' | 'alerts') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const { unreadNotifCount } = useTracker();

  const tabs = [
    {
      id: 'upcoming' as const,
      label: 'Releases',
      icon: Calendar,
      badge: 0,
    },
    {
      id: 'tracked' as const,
      label: 'Tracked',
      icon: UserCheck,
      badge: 0,
    },
    {
      id: 'read' as const,
      label: 'Finished',
      icon: CheckCircle2,
      badge: 0,
    },
    {
      id: 'alerts' as const,
      label: 'Alerts',
      icon: BellRing,
      badge: unreadNotifCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-lg pb-safe">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-colors ${
                isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 font-medium ${isActive ? 'text-amber-400 font-semibold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
