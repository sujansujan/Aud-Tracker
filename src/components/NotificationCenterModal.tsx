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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">Release Alerts & Notification Center</h3>
              <p className="text-xs text-slate-400">Push reminders for 1-week, 1-day, and release-day milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Notification Permissions & Preferences */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">System Push Notifications</span>
                <span className="text-[11px] text-slate-400">
                  {hasSystemPerm
                    ? 'Browser push permission active'
                    : 'Enable browser permission to receive alerts even when app is minimized'}
                </span>
              </div>
              {!hasSystemPerm ? (
                <button
                  onClick={requestSystemNotificationPermission}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition"
                >
                  Enable Push
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  Granted
                </span>
              )}
            </div>

            {/* Notification Milestone Toggles */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">
                Default Milestone Reminders
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs font-medium text-slate-200">
                  <input
                    type="checkbox"
                    checked={pushSettings.notifyOneWeek}
                    onChange={(e) => updatePushSettings({ notifyOneWeek: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span>1 Week Prior</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs font-medium text-slate-200">
                  <input
                    type="checkbox"
                    checked={pushSettings.notifyOneDay}
                    onChange={(e) => updatePushSettings({ notifyOneDay: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span>1 Day Prior</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs font-medium text-slate-200">
                  <input
                    type="checkbox"
                    checked={pushSettings.notifyDayOf}
                    onChange={(e) => updatePushSettings({ notifyDayOf: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span>Day of Release</span>
                </label>
              </div>
            </div>

            {/* Test Trigger Button */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={triggerTestNotification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-amber-400" />
                <span>Trigger Test Alert & Chime</span>
              </button>
              
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushSettings.soundEnabled}
                  onChange={(e) => updatePushSettings({ soundEnabled: e.target.checked })}
                  className="accent-amber-500"
                />
                <span>Audio Chime</span>
              </label>
            </div>
          </div>

          {/* Scheduled Upcoming Alarm Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Upcoming Scheduled Trigger Schedule</span>
            </h4>
            <div className="space-y-2">
              {upcomingScheduled.map((item, idx) => (
                <div
                  key={`${item.book.id}-${item.type}-${idx}`}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-white truncate">{item.book.title}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      Trigger: <strong className="text-amber-400 font-semibold">{item.type}</strong> ({item.book.author})
                    </p>
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono tabular-nums">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Alerts Log */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Received Alerts Log ({notifications.length})
              </h4>
              {notifications.length > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  Mark All Read
                </button>
              )}
            </div>

            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center">No alerts logged yet.</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 cursor-pointer ${
                      notif.read
                        ? 'bg-slate-900/50 border-slate-800 text-slate-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                        )}
                        <h5 className="font-bold text-xs text-white">{notif.title}</h5>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block tabular-nums">
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
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
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
