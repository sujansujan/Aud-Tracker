import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { X, Bell, BellRing, CheckCircle, Trash2, Send } from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    pushSettings,
    updatePushSettings,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    triggerTestNotification,
    requestSystemNotificationPermission,
  } = useTracker();

  if (!isOpen) return null;

  const hasSystemPerm = pushSettings.pushEnabled;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border sm:border flex flex-col max-h-[90vh] overflow-hidden select-none transition-colors duration-200 animate-in slide-in-from-bottom sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
              className="flex h-9 w-9 items-center justify-center rounded-2xl font-bold shadow-sm"
            >
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-extrabold">Notifications &amp; Alerts</h3>
              <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-[11px]">
                Native Android release alerts &amp; history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md-btn-icon shadow-xs"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Native Android Permission Control Card */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="p-4 rounded-3xl border space-y-3.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block">Native Android Permission</span>
                <span
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px]"
                >
                  {hasSystemPerm
                    ? 'Status bar notifications enabled'
                    : 'Enable native OS permission to receive drop alerts'}
                </span>
              </div>
              {!hasSystemPerm ? (
                <button
                  type="button"
                  onClick={requestSystemNotificationPermission}
                  className="md-btn-fab min-h-[38px] px-3.5 text-xs font-bold"
                >
                  Enable Alerts
                </button>
              ) : (
                <span
                  style={{
                    backgroundColor: 'var(--md-sys-color-accent-green-container)',
                    color: 'var(--md-sys-color-accent-green)',
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-bold"
                >
                  Active
                </span>
              )}
            </div>

            {/* Notification Milestone Toggles */}
            <div
              style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
              className="pt-2.5 border-t space-y-2"
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
                  <span>1 Wk Prior</span>
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
                  <span>Release Day</span>
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
                className="md-btn-tonal min-h-[38px] px-3.5 text-xs gap-1.5 font-bold"
              >
                <Send className="h-3.5 w-3.5" style={{ color: 'var(--md-sys-color-primary)' }} />
                <span>Send Test Alert</span>
              </button>
            </div>
          </div>

          {/* Triggered Notifications Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4
                style={{ color: 'var(--md-sys-color-primary)' }}
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <BellRing className="h-3.5 w-3.5" />
                <span>Notification Log ({notifications.length})</span>
              </h4>

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="text-xs font-bold hover:underline cursor-pointer"
                >
                  Mark All Read
                </button>
              )}
            </div>

            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}
                  className="text-center py-6 rounded-2xl border text-xs"
                >
                  No release notifications yet. Watchlists are actively monitoring!
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      backgroundColor: notif.read
                        ? 'var(--md-sys-color-surface)'
                        : 'var(--md-sys-color-primary-container)',
                      borderColor: 'var(--md-sys-color-outline-variant)',
                    }}
                    className="p-3 rounded-2xl border flex items-start justify-between gap-3 text-xs shadow-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold flex items-center gap-1.5">
                        {!notif.read && (
                          <span
                            style={{ backgroundColor: 'var(--md-sys-color-primary)' }}
                            className="h-2 w-2 rounded-full shrink-0"
                          />
                        )}
                        <span className="truncate">{notif.title}</span>
                      </div>
                      <p
                        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        className="text-[11px] leading-relaxed"
                      >
                        {notif.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(notif.id)}
                          style={{ color: 'var(--md-sys-color-primary)' }}
                          className="p-1 rounded-lg hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                          title="Mark read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteNotification(notif.id)}
                        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        className="p-1 rounded-lg hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
