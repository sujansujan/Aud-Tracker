package com.audiotracker.app.data

import android.content.Context
import android.content.SharedPreferences

class PreferencesManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("audible_tracker_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_THEME = "key_theme_dark"
        private const val KEY_COMFORT_TEXT = "key_comfort_text"
        private const val KEY_NOTIF_ENABLED = "key_notif_enabled"
        private const val KEY_NOTIF_ONE_WEEK = "key_notif_one_week"
        private const val KEY_NOTIF_ONE_DAY = "key_notif_one_day"
        private const val KEY_NOTIF_TODAY = "key_notif_today"
    }

    var isDarkTheme: Boolean
        get() = prefs.getBoolean(KEY_THEME, false)
        set(value) = prefs.edit().putBoolean(KEY_THEME, value).apply()

    var isComfortTextMode: Boolean
        get() = prefs.getBoolean(KEY_COMFORT_TEXT, false)
        set(value) = prefs.edit().putBoolean(KEY_COMFORT_TEXT, value).apply()

    var isNotificationsEnabled: Boolean
        get() = prefs.getBoolean(KEY_NOTIF_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_NOTIF_ENABLED, value).apply()

    var isOneWeekNotificationEnabled: Boolean
        get() = prefs.getBoolean(KEY_NOTIF_ONE_WEEK, true)
        set(value) = prefs.edit().putBoolean(KEY_NOTIF_ONE_WEEK, value).apply()

    var isOneDayNotificationEnabled: Boolean
        get() = prefs.getBoolean(KEY_NOTIF_ONE_DAY, true)
        set(value) = prefs.edit().putBoolean(KEY_NOTIF_ONE_DAY, value).apply()

    var isDayOfReleaseNotificationEnabled: Boolean
        get() = prefs.getBoolean(KEY_NOTIF_TODAY, true)
        set(value) = prefs.edit().putBoolean(KEY_NOTIF_TODAY, value).apply()
}
