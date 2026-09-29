package com.audiotracker.app.model

import java.time.LocalDate
import java.time.temporal.ChronoUnit

enum class Genre(val displayName: String) {
    SCI_FI("Sci-Fi"),
    FANTASY("Fantasy"),
    LITRPG("LitRPG"),
    THRILLER("Thriller"),
    MYSTERY("Mystery"),
    NON_FICTION("Non-Fiction"),
    HORROR("Horror"),
    ROMANCE("Romance"),
    HISTORICAL("Historical")
}

data class SeriesInfo(
    val name: String,
    val bookNumber: String? = null
)

data class AudiobookReminders(
    val oneWeekBefore: Boolean = true,
    val oneDayBefore: Boolean = true,
    val dayOfRelease: Boolean = true
)

data class Audiobook(
    val id: String,
    val title: String,
    val series: SeriesInfo? = null,
    val author: String,
    val narrators: List<String> = emptyList(),
    val releaseDate: String, // YYYY-MM-DD
    val coverUrl: String,
    val runtimeHours: Double? = null,
    val genre: Genre,
    val audibleRating: Double = 4.8,
    val ratingCount: Int = 1200,
    val synopsis: String,
    val audibleUrl: String? = null,
    val isRead: Boolean = false,
    val downloaded: Boolean = false,
    val listened: Boolean = false,
    val readCompletedAt: String? = null,
    val userPersonalRating: Int? = null,
    val userNotes: String? = null,
    val reminders: AudiobookReminders = AudiobookReminders()
) {
    val narratorText: String
        get() = narrators.joinToString(", ")

    val daysUntilRelease: Long
        get() {
            return try {
                val target = LocalDate.parse(releaseDate)
                val current = LocalDate.of(2026, 9, 27)
                ChronoUnit.DAYS.between(current, target)
            } catch (e: Exception) {
                0L
            }
        }

    val countdownLabel: String
        get() {
            val d = daysUntilRelease
            return when {
                d < 0 -> "Released ${-d}d ago"
                d == 0L -> "Out Today!"
                d == 1L -> "Releases Tomorrow"
                d <= 7L -> "In $d days (1 wk)"
                d <= 30L -> "In $d days"
                else -> "In ${d / 7} weeks"
            }
        }
}

data class WatchlistItem(
    val id: String,
    val type: String, // "Author", "Series", "Narrator"
    val name: String,
    val url: String = ""
)

data class MuteRule(
    val id: String,
    val type: String,
    val value: String
)

data class ReleaseNotification(
    val id: String,
    val bookId: String,
    val bookTitle: String,
    val title: String,
    val message: String,
    val timestamp: Long = System.currentTimeMillis(),
    val read: Boolean = false
)

enum class ViewFilter(val label: String) {
    ALL("All Releases"),
    UPCOMING("Upcoming Only"),
    TODAY("Releasing Today"),
    DOWNLOADED("Downloaded"),
    LISTENED("Listened / Read")
}

enum class SortOption(val label: String, val sublabel: String) {
    RELEASE_SOONEST("Release: Soonest / Upcoming First", "Default Audible release schedule"),
    RELEASE_NEWEST("Release: Newest First", "Latest release date to oldest"),
    RELEASE_OLDEST("Release: Oldest First", "Earliest release date"),
    TITLE_ASC("Title: A to Z", "Alphabetical ascending"),
    TITLE_DESC("Title: Z to A", "Alphabetical descending"),
    AUTHOR_ASC("Author: A to Z", "Grouped by author name"),
    RATING_DESC("Audible Rating: Highest First", "Top rated books (★)"),
    DURATION_DESC("Duration: Longest First", "Longest runtime audiobooks"),
    DURATION_ASC("Duration: Shortest First", "Quick listens & novellas")
}
