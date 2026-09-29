import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { getScheduledAlertDates } from '../utils/notifications';
import { X, Bell, BellRing, Volume2, VolumeX, CheckCircle, Trash2, Calendar, Sparkles, Send } from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    pushSettings,
    updatePushSettings,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    triggerTestNotification,
    requestSystemNotificationPermission,
    books,
  } = useTracker();

  if (!isOpen) return null;

  // Compute future scheduled reminders for unread upcoming releases
  const upcomingScheduled = books
    .filter((b) => !b.isRead)
    .flatMap((b) => {
      const dates = getScheduledAlertDates(b.releaseDate);
      const items = [];
      if (b.reminders.oneWeekBefore) {
        items.push({
          book: b,
          type: '1 Week Before',
          date: dates.oneWeekBefore,
        });
      }
      if (b.reminders.oneDayBefore) {
        items.push({
          book: b,
          type: '1 Day Before',
          date: dates.oneDayBefore,
        });
      }
      if (b.reminders.dayOfRelease) {
        items.push({
          book: b,
          type: 'Day of Release',
          date: dates.dayOfRelease,
        });
      }
      return items;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  const hasSystemPerm = typeof Notification !== 'undefined' && Notification.permission === 'granted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border overflow-hidden select-none transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl font-bold shadow-md"
            >
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold">Release Alerts &amp; Notifications</h3>
              <p
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="text-xs"
              >
                1-week, 1-day, and release-day milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md-btn-icon shadow-xs"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Notification Permissions & Preferences */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="p-4 rounded-3xl border space-y-3.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block">System Push Notifications</span>
                <span
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px]"
                >
                  {hasSystemPerm
                    ? 'Browser push notification permission active'
                    : 'Enable browser permission to receive alerts even when app is minimized'}
                </span>
              </div>
              {!hasSystemPerm ? (
                <button
                  type="button"
                  onClick={requestSystemNotificationPermission}
                  className="md-btn-fab min-h-[38px] px-3.5 text-xs"
                >
                  Enable Push
                </button>
              ) : (
                <span
                  style={{
                    backgroundColor: 'var(--md-sys-color-accent-green-container)',
                    color: 'var(--md-sys-color-accent-green)',
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-bold"
                >
                  Granted
                </span>
              )}
            </div>

            {/* Notification Milestone Toggles */}
            <div
              style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
              className="pt-2 border-t space-y-2"
            >
              <span
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="text-[11px] font-bold uppercase tracking-wider block"
              >
                Default Milestone Reminders
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-2xl border cursor-pointer text-xs font-semibold shadow-xs"
                >
                  <input
                    type="checkbox"
                    checked={pushSettings.notifyOneWeek}
                    onChange={(e) => updatePushSettings({ notifyOneWeek: e.target.checked })}
                    className="accent-[var(--md-sys-color-primary)] rounded"
                  />
                  <span>1 Week Prior</span>
                </label>

                <label
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-2xl border cursor-pointer text-xs font-semibold shadow-xs"
                >
                  <input
                    type="checkbox"
                    checked={pushSettings.notifyOneDay}
                    onChange={(e) => updatePushSettings({ notifyOneDay: e.target.checked })}
                    className="accent-[var(--md-sys-color-primary)] rounded"
                  />
                  <span>1 Day Prior</span>
                </label>

                <label
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-2xl border cursor-pointer text-xs font-semibold shadow-xs"
                >
                  <input
                    type="checkbox"
                    checked={pushSettings.notifyDayOf}
                    onChange={(e) => updatePushSettings({ notifyDayOf: e.target.checked })}
                    className="accent-[var(--md-sys-color-primary)] rounded"
                  />
                  <span>Day of Release</span>
                </label>
              </div>
            </div>

            {/* Test Trigger Button */}
            <div
              style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
              className="pt-2 border-t flex items-center justify-between"
            >
              <button
                type="button"
                onClick={triggerTestNotification}
                className="md-btn-tonal min-h-[38px] px-3 text-xs gap-1.5 font-bold"
              >
                <Send className="h-3.5 w-3.5" style={{ color: 'var(--md-sys-color-primary)' }} />
                <span>Test Alert &amp; Chime</span>
              </button>

              <label
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={pushSettings.soundEnabled}
                  onChange={(e) => updatePushSettings({ soundEnabled: e.target.checked })}
                  className="accent-[var(--md-sys-color-primary)]"
                />
                <span>Audio Chime</span>
              </label>
            </div>
          </div>

          {/* Scheduled Upcoming Alarm Timeline */}
          <div>
            <h4
              style={{ color: 'var(--md-sys-color-primary)' }}
              className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Upcoming Scheduled Trigger Schedule</span>
            </h4>
            <div className="space-y-2">
              {upcomingScheduled.map((item, idx) => (
                <div
                  key={`${item.book.id}-${item.type}-${idx}`}
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="p-3 rounded-2xl border flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold truncate">{item.book.title}</p>
                    <p
                      style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                      className="text-[11px] truncate mt-0.5"
                    >
                      Trigger:{' '}
                      <strong style={{ color: 'var(--md-sys-color-primary)' }}>{item.type}</strong>{' '}
                      ({item.book.author})
                    </p>
                  </div>
                  <span
                    style={{
                      backgroundColor: 'var(--md-sys-color-surface-container)',
                      borderColor: 'var(--md-sys-color-outline-variant)',
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-xl border text-[11px] font-mono tabular-nums font-semibold"
                  >
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Alerts Log */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4
                style={{ color: 'var(--md-sys-color-primary)' }}
                className="text-xs font-bold uppercase tracking-wider"
              >
                Received Alerts Log ({notifications.length})
              </h4>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  style={{ color: 'var(--md-sys-color-secondary)' }}
                  className="text-xs font-bold hover:underline cursor-pointer"
                >
                  Mark All Read
                </button>
              )}
            </div>

            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-xs italic p-4 text-center"
                >
                  No alerts logged yet.
                </p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    style={{
                      backgroundColor: notif.read
                        ? 'var(--md-sys-color-surface-container-low)'
                        : 'var(--md-sys-color-primary-container)',
                      borderColor: notif.read
                        ? 'var(--md-sys-color-outline-variant)'
                        : 'var(--md-sys-color-primary)',
                      color: notif.read
                        ? 'var(--md-sys-color-on-surface)'
                        : 'var(--md-sys-color-on-primary-container)',
                    }}
                    className="p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 cursor-pointer shadow-xs active:scale-98"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <span
                            style={{ backgroundColor: 'var(--md-sys-color-primary)' }}
                            className="h-2 w-2 rounded-full shrink-0"
                          />
                        )}
                        <h5 className="font-bold text-xs">{notif.title}</h5>
                      </div>
                      <p className="text-xs mt-1 opacity-90">{notif.message}</p>
                      <span className="text-[10px] opacity-75 mt-1 block tabular-nums">
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="opacity-60 hover:opacity-100 p-1 cursor-pointer"
                      title="Delete alert"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="p-4 border-t flex justify-end"
        >
          <button
            type="button"
            onClick={onClose}
            className="md-btn-fab min-h-[44px] px-6 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
