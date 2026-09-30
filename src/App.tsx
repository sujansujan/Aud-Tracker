import React, { useEffect } from 'react';
import { SpecTrackerProvider, useSpecTracker } from './context/SpecTrackerContext';
import { UpcomingScreen } from './components/spec/UpcomingScreen';
import { SearchScreen } from './components/spec/SearchScreen';
import { FollowingScreen } from './components/spec/FollowingScreen';
import { SettingsScreen } from './components/spec/SettingsScreen';
import { BookDetailScreen } from './components/spec/BookDetailScreen';
import { AuthorDetailScreen } from './components/spec/AuthorDetailScreen';
import { SeriesDetailScreen } from './components/spec/SeriesDetailScreen';
import { SpecBottomNav } from './components/spec/SpecBottomNav';
import { UndoSnackbar } from './components/spec/UndoSnackbar';
import { initNativeAndroidChannel } from './utils/notifications';

function SpecAppShell() {
  const {
    activeTab,
    selectedBookId,
    selectedAuthorId,
    selectedSeriesId,
  } = useSpecTracker();

  useEffect(() => {
    initNativeAndroidChannel();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-surface)] transition-colors">
      <main>
        {/* Pushed Detail Screens */}
        {selectedBookId ? (
          <BookDetailScreen />
        ) : selectedAuthorId ? (
          <AuthorDetailScreen />
        ) : selectedSeriesId ? (
          <SeriesDetailScreen />
        ) : (
          /* Main 4 Tabs */
          <>
            {activeTab === 'upcoming' && <UpcomingScreen />}
            {activeTab === 'search' && <SearchScreen />}
            {activeTab === 'following' && <FollowingScreen />}
            {activeTab === 'settings' && <SettingsScreen />}
          </>
        )}
      </main>

      {/* 4-Destination Bottom Navigation Bar (Hidden when inside pushed detail screen) */}
      {!selectedBookId && !selectedAuthorId && !selectedSeriesId && <SpecBottomNav />}

      {/* Undo Snackbar */}
      <UndoSnackbar />
    </div>
  );
}

export default function App() {
  return (
    <SpecTrackerProvider>
      <SpecAppShell />
    </SpecTrackerProvider>
  );
}
