package com.audiotracker.app.data

import com.audiotracker.app.model.*
import java.time.Clock
import java.time.LocalDate

interface BookRemoteSource {
    suspend fun searchBooks(query: String, marketplace: Marketplace): List<Book>
    suspend fun searchAuthors(query: String): List<Author>
    suspend fun searchSeries(query: String): List<Series>
    suspend fun getBooks(ids: List<String>, marketplace: Marketplace): List<Book>
    suspend fun getAuthorBooks(authorId: String, marketplace: Marketplace): List<Book>
    suspend fun getSeriesBooks(seriesId: String, marketplace: Marketplace): List<Book>
}

/**
 * Repository interface following Clean Architecture & MVVM
 */
interface AudiobookRepository {
    suspend fun getComputedUpcomingBooks(filter: ReleaseStatus, clock: Clock): List<Book>
    suspend fun followBook(bookId: String, reminderOffsets: List<Int>?, alsoAuthorId: String?, alsoSeriesId: String?)
    suspend fun unfollowBook(bookId: String)
    suspend fun archiveBook(bookId: String)
    suspend fun dismissBook(bookId: String)
    suspend fun followAuthor(authorId: String)
    suspend fun unfollowAuthor(authorId: String)
    suspend fun followSeries(seriesId: String)
    suspend fun unfollowSeries(seriesId: String)
    suspend fun syncFollowedEntities()
}
