import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-xl bg-amber-500/95 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-xl backdrop-blur-sm sm:left-auto sm:right-4 sm:w-auto">
      <WifiOff className="h-4 w-4 shrink-0 text-slate-950" />
      <span>Offline Mode — Cached audiobooks and tracking records active</span>
    </div>
  );
};
