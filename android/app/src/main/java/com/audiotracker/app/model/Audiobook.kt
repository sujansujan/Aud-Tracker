package com.audiotracker.app.model

import java.time.LocalDate
import java.time.temporal.ChronoUnit

enum class Marketplace(val code: String, val displayName: String) {
    US("US", "Audible.com"),
    UK("UK", "Audible.co.uk"),
    CA("CA", "Audible.ca"),
    AU("AU", "Audible.com.au"),
    DE("DE", "Audible.de"),
    FR("FR", "Audible.fr"),
    JP("JP", "Audible.co.jp"),
    IN("IN", "Audible.in")
}

enum class DateConfidence {
    CONFIRMED,
    MONTH_ONLY,
    TBA
}

enum class ReleaseStatus {
    UPCOMING,
    RELEASED
}

enum class FollowType {
    BOOK,
    AUTHOR,
    SERIES
}

/**
 * Room Entity: Book
 */
data class Book(
    val id: String, // ASIN
    val title: String,
    val subtitle: String? = null,
    val seriesId: String? = null,
    val seriesPosition: String? = null,
    val coverUrl: String? = null,
    val description: String? = null,
    val durationMinutes: Int? = null,
    val narrators: List<String> = emptyList(), // Display names only
    val marketplace: Marketplace = Marketplace.US,
    val storeUrl: String,
    val releaseDate: LocalDate? = null,
    val dateConfidence: DateConfidence = DateConfidence.CONFIRMED,
    val status: ReleaseStatus = ReleaseStatus.UPCOMING,
    val firstSeenAt: String,
    val updatedAt: String
)

/**
 * Room Entity: Author
 */
data class Author(
    val id: String,
    val name: String,
    val imageUrl: String? = null,
    val bio: String? = null
)

/**
 * Room Entity: Series
 */
data class Series(
    val id: String,
    val name: String,
    val primaryAuthorName: String? = null,
    val imageUrl: String? = null
)

/**
 * Room Entity: BookAuthor (Join table)
 */
data class BookAuthor(
    val bookId: String,
    val authorId: String,
    val position: Int = 0 // 0 for primary author
)

/**
 * Room Entity: Follow (Polymorphic table)
 */
data class Follow(
    val type: FollowType,
    val targetId: String,
    val followedAt: String,
    val reminderOffsets: List<Int>? = null, // e.g. [0, 1]
    val archived: Boolean = false,
    val baselineSyncedAt: String,
    val notifyNewBooks: Boolean = true
)

/**
 * Room Entity: DismissedBook
 */
data class DismissedBook(
    val bookId: String,
    val dismissedAt: String
)

/**
 * Room Entity: ReleaseHistory
 */
data class ReleaseHistory(
    val id: String,
    val bookId: String,
    val oldDate: LocalDate? = null,
    val newDate: LocalDate? = null,
    val oldConfidence: DateConfidence? = null,
    val newConfidence: DateConfidence? = null,
    val changedAt: String
)

/**
 * Room Entity: SearchHistory
 */
data class SearchHistory(
    val query: String,
    val searchedAt: String
)

/**
 * Room Entity: NotificationLog
 */
data class NotificationLog(
    val id: String,
    val bookId: String,
    val type: String, // reminder, date_changed, new_book, now_available
    val scheduledFor: String,
    val deliveredAt: String? = null
)

/**
 * 4 Main Destinations per Spec
 */
enum class MainNavTab(val title: String) {
    UPCOMING("Upcoming"),
    SEARCH("Search"),
    FOLLOWING("Following"),
    SETTINGS("Settings")
}
