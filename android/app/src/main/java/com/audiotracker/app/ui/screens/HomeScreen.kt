package com.audiotracker.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.audiotracker.app.data.AudiobookRepository
import com.audiotracker.app.model.Audiobook
import com.audiotracker.app.model.SortOption
import com.audiotracker.app.model.ViewFilter
import com.audiotracker.app.ui.components.AudiobookCard
import com.audiotracker.app.ui.components.BookDetailSheet
import com.audiotracker.app.ui.components.SortFilterSheet

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    repository: AudiobookRepository,
    isDarkTheme: Boolean,
    onToggleTheme: () -> Unit
) {
    val books by repository.books.collectAsState()
    val selectedIds by repository.selectedIds.collectAsState()
    val viewFilter by repository.viewFilter.collectAsState()
    val sortOption by repository.sortOption.collectAsState()
    val searchQuery by repository.searchQuery.collectAsState()

    var isSearchOpen by remember { mutableStateOf(false) }
    var isSortSheetOpen by remember { mutableStateOf(false) }
    var selectedBookForDetail by remember { mutableStateOf<Audiobook?>(null) }

    // Dynamic Filter counts
    val counts = remember(books) {
        mapOf(
            ViewFilter.ALL to books.size,
            ViewFilter.UPCOMING to books.count { it.daysUntilRelease >= 0 },
            ViewFilter.TODAY to books.count { it.daysUntilRelease == 0L },
            ViewFilter.DOWNLOADED to books.count { it.downloaded },
            ViewFilter.LISTENED to books.count { it.listened || it.isRead }
        )
    }

    // Filter & Sort calculation
    val filteredBooks = remember(books, viewFilter, sortOption, searchQuery) {
        books
            .filter { book ->
                val matchesFilter = when (viewFilter) {
                    ViewFilter.ALL -> true
                    ViewFilter.UPCOMING -> book.daysUntilRelease >= 0
                    ViewFilter.TODAY -> book.daysUntilRelease == 0L
                    ViewFilter.DOWNLOADED -> book.downloaded
                    ViewFilter.LISTENED -> book.listened || book.isRead
                }
                val matchesQuery = if (searchQuery.isBlank()) true else {
                    val q = searchQuery.lowercase()
                    book.title.lowercase().contains(q) ||
                    book.author.lowercase().contains(q) ||
                    (book.series?.name?.lowercase()?.contains(q) == true) ||
                    book.narrators.any { it.lowercase().contains(q) }
                }
                matchesFilter && matchesQuery
            }
            .sortedWith { a, b ->
                when (sortOption) {
                    SortOption.RELEASE_NEWEST -> b.releaseDate.compareTo(a.releaseDate)
                    SortOption.RELEASE_OLDEST -> a.releaseDate.compareTo(b.releaseDate)
                    SortOption.TITLE_ASC -> a.title.compareTo(b.title)
                    SortOption.TITLE_DESC -> b.title.compareTo(a.title)
                    SortOption.AUTHOR_ASC -> a.author.compareTo(b.author)
                    SortOption.RATING_DESC -> b.audibleRating.compareTo(a.audibleRating)
                    SortOption.DURATION_DESC -> (b.runtimeHours ?: 0.0).compareTo(a.runtimeHours ?: 0.0)
                    SortOption.DURATION_ASC -> (a.runtimeHours ?: 0.0).compareTo(b.runtimeHours ?: 0.0)
                    SortOption.RELEASE_SOONEST -> {
                        val upA = a.daysUntilRelease >= 0
                        val upB = b.daysUntilRelease >= 0
                        if (upA && !upB) -1
                        else if (!upA && upB) 1
                        else if (upA && upB) a.daysUntilRelease.compareTo(b.daysUntilRelease)
                        else b.daysUntilRelease.compareTo(a.daysUntilRelease)
                    }
                }
            }
    }

    Scaffold(
        topBar = {
            Column {
                // Minimal Top Bar (No app name, clean native tools)
                TopAppBar(
                    title = {},
                    navigationIcon = {
                        IconButton(onClick = {}) {
                            Icon(Icons.Default.Menu, contentDescription = "Menu")
                        }
                    },
                    actions = {
                        // Search Toggle
                        IconButton(onClick = { isSearchOpen = !isSearchOpen }) {
                            Icon(
                                Icons.Default.Search,
                                contentDescription = "Search",
                                tint = if (isSearchOpen) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                            )
                        }

                        // Sort & Filter (Next to Add button)
                        IconButton(onClick = { isSortSheetOpen = true }) {
                            BadgedBox(
                                badge = {
                                    if (viewFilter != ViewFilter.ALL || sortOption != SortOption.RELEASE_SOONEST) {
                                        Badge()
                                    }
                                }
                            ) {
                                Icon(
                                    Icons.Default.FilterList,
                                    contentDescription = "Sort and Filter",
                                    tint = if (viewFilter != ViewFilter.ALL || sortOption != SortOption.RELEASE_SOONEST)
                                        MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }

                        // + Add FAB
                        FilledTonalButton(
                            onClick = {},
                            shape = RoundedCornerShape(14.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Add", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        // Select All Button (Located near settings button)
                        IconButton(onClick = {
                            if (selectedIds.size >= filteredBooks.size && filteredBooks.isNotEmpty()) {
                                repository.clearSelection()
                            } else {
                                repository.selectAll(filteredBooks.map { it.id })
                            }
                        }) {
                            Icon(
                                if (selectedIds.size >= filteredBooks.size && filteredBooks.isNotEmpty())
                                    Icons.Default.CheckBox else Icons.Default.CheckBoxOutlineBlank,
                                contentDescription = "Select All",
                                tint = if (selectedIds.isNotEmpty()) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                            )
                        }

                        // Theme Mode Switcher
                        IconButton(onClick = onToggleTheme) {
                            Icon(
                                if (isDarkTheme) Icons.Default.WbSunny else Icons.Default.NightlightRound,
                                contentDescription = "Toggle Theme"
                            )
                        }

                        // Settings
                        IconButton(onClick = {}) {
                            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = MaterialTheme.colorScheme.primary)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )

                // Expandable Search Bar
                AnimatedVisibility(visible = isSearchOpen) {
                    Surface(
                        color = MaterialTheme.colorScheme.surface,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 6.dp)
                    ) {
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { repository.setSearchQuery(it) },
                            placeholder = { Text("Search audiobooks, authors, series...", fontSize = 13.sp) },
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                            trailingIcon = {
                                if (searchQuery.isNotEmpty()) {
                                    IconButton(onClick = { repository.setSearchQuery("") }) {
                                        Icon(Icons.Default.Close, contentDescription = "Clear")
                                    }
                                }
                            },
                            shape = RoundedCornerShape(24.dp),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                }

                // Status Banner
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Showing ${filteredBooks.size} audiobooks · Long-press to select",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        if (viewFilter != ViewFilter.ALL) {
                            TextButton(
                                onClick = { repository.setViewFilter(ViewFilter.ALL) },
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Text("Clear Filter", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        },
        bottomBar = {
            // Floating Batch Selection Bar
            AnimatedVisibility(visible = selectedIds.isNotEmpty()) {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shadowElevation = 8.dp,
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${selectedIds.size} Selected",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )

                        Row {
                            TextButton(onClick = { repository.clearSelection() }) {
                                Text("Deselect")
                            }
                            IconButton(onClick = { repository.deleteBooks(selectedIds) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        // Native Compact Poster Grid with Native Long-Press Selection
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 160.dp),
            contentPadding = PaddingValues(12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            items(filteredBooks, key = { it.id }) { book ->
                AudiobookCard(
                    book = book,
                    isSelected = selectedIds.contains(book.id),
                    isSelectionActive = selectedIds.isNotEmpty(),
                    onToggleSelect = { repository.toggleSelection(it) },
                    onClick = { selectedBookForDetail = it }
                )
            }
        }
    }

    // Sort & Filter BottomSheet
    if (isSortSheetOpen) {
        SortFilterSheet(
            currentFilter = viewFilter,
            currentSort = sortOption,
            counts = counts,
            onSelectFilter = { repository.setViewFilter(it) },
            onSelectSort = { repository.setSortOption(it) },
            onDismiss = { isSortSheetOpen = false }
        )
    }

    // Book Detail BottomSheet
    if (selectedBookForDetail != null) {
        BookDetailSheet(
            book = selectedBookForDetail,
            onDismiss = { selectedBookForDetail = null },
            onToggleDownload = { repository.toggleDownload(it) },
            onMarkAsRead = { repository.markAsRead(it) }
        )
    }
}
