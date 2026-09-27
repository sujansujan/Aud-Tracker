import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { WatchlistDialog } from './WatchlistDialog';

export const TrackedEntitiesManager: React.FC = () => {
  return <WatchlistDialog isOpen={true} onClose={() => {}} />;
};
