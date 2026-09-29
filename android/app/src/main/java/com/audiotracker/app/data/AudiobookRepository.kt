package com.audiotracker.app.data

import com.audiotracker.app.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class AudiobookRepository {

    private val _books = MutableStateFlow<List<Audiobook>>(initialCatalog)
    val books: StateFlow<List<Audiobook>> = _books.asStateFlow()

    private val _selectedIds = MutableStateFlow<Set<String>>(emptySet())
    val selectedIds: StateFlow<Set<String>> = _selectedIds.asStateFlow()

    private val _viewFilter = MutableStateFlow(ViewFilter.ALL)
    val viewFilter: StateFlow<ViewFilter> = _viewFilter.asStateFlow()

    private val _sortOption = MutableStateFlow(SortOption.RELEASE_SOONEST)
    val sortOption: StateFlow<SortOption> = _sortOption.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setViewFilter(filter: ViewFilter) {
        _viewFilter.value = filter
    }

    fun setSortOption(sort: SortOption) {
        _sortOption.value = sort
    }

    fun toggleSelection(bookId: String) {
        _selectedIds.update { current ->
            if (current.contains(bookId)) current - bookId else current + bookId
        }
    }

    fun selectAll(bookIds: List<String>) {
        _selectedIds.value = bookIds.toSet()
    }

    fun clearSelection() {
        _selectedIds.value = emptySet()
    }

    fun toggleDownload(bookId: String) {
        _books.update { list ->
            list.map { if (it.id == bookId) it.copy(downloaded = !it.downloaded) else it }
        }
    }

    fun markAsRead(bookId: String, rating: Int? = 5, notes: String? = null) {
        _books.update { list ->
            list.map {
                if (it.id == bookId) {
                    it.copy(
                        isRead = true,
                        listened = true,
                        userPersonalRating = rating,
                        userNotes = notes
                    )
                } else it
            }
        }
    }

    fun addBook(book: Audiobook) {
        _books.update { listOf(book) + it }
    }

    fun deleteBooks(ids: Set<String>) {
        _books.update { list -> list.filterNot { ids.contains(it.id) } }
        _selectedIds.update { it - ids }
    }

    companion object {
        val initialCatalog = listOf(
            Audiobook(
                id = "b-1",
                title = "Wind and Truth (Stormlight Archive, Book 5)",
                series = SeriesInfo("The Stormlight Archive", "5"),
                author = "Brandon Sanderson",
                narrators = listOf("Michael Kramer", "Kate Reading"),
                releaseDate = "2026-12-06",
                coverUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
                runtimeHours = 57.5,
                genre = Genre.FANTASY,
                audibleRating = 4.9,
                ratingCount = 28400,
                synopsis = "The explosive finale to the first arc of Brandon Sanderson's epic Stormlight Archive saga.",
                audibleUrl = "https://www.audible.com"
            ),
            Audiobook(
                id = "b-2",
                title = "This Inevitable Ruin (Dungeon Crawler Carl, Book 7)",
                series = SeriesInfo("Dungeon Crawler Carl", "7"),
                author = "Matt Dinniman",
                narrators = listOf("Jeff Hays"),
                releaseDate = "2026-10-15",
                coverUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
                runtimeHours = 24.2,
                genre = Genre.LITRPG,
                audibleRating = 4.95,
                ratingCount = 34500,
                synopsis = "Carl and Princess Donut plunge into the Ninth Floor: The Faction Wars. Total chaos, full-cast audio mastery by Jeff Hays.",
                audibleUrl = "https://www.audible.com"
            ),
            Audiobook(
                id = "b-3",
                title = "Not Till We Are Lost (Bobiverse, Book 5)",
                series = SeriesInfo("Bobiverse", "5"),
                author = "Dennis E. Taylor",
                narrators = listOf("Ray Porter"),
                releaseDate = "2026-09-27",
                coverUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400",
                runtimeHours = 14.8,
                genre = Genre.SCI_FI,
                audibleRating = 4.85,
                ratingCount = 18900,
                synopsis = "The Bobs face a massive new cosmic anomaly threatening the Coalition.",
                audibleUrl = "https://www.audible.com"
            ),
            Audiobook(
                id = "b-4",
                title = "The Mercy of Gods (The Captive's War, Book 1)",
                series = SeriesInfo("The Captive's War", "1"),
                author = "James S.A. Corey",
                narrators = listOf("Jefferson Mays"),
                releaseDate = "2026-08-06",
                coverUrl = "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=400",
                runtimeHours = 16.0,
                genre = Genre.SCI_FI,
                audibleRating = 4.7,
                ratingCount = 8900,
                synopsis = "From the creators of The Expanse comes a monumental space opera about humanity under alien subjugation.",
                audibleUrl = "https://www.audible.com"
            )
        )
    }
}
