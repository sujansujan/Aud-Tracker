package com.audiotracker.app.service

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.audiotracker.app.data.AudiobookRepository
import java.time.LocalDate

class AudibleBackgroundWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val notificationService = AudibleNotificationService(applicationContext)

        // Check if any books release today or soon
        val today = LocalDate.of(2026, 9, 27)

        for (book in AudiobookRepository.initialCatalog) {
            try {
                val rel = LocalDate.parse(book.releaseDate)
                if (rel.isEqual(today)) {
                    notificationService.postReleaseNotification(
                        book.id.hashCode(),
                        "🎉 Out Today: ${book.title}",
                        "${book.title} by ${book.author} is now live on Audible! Narrated by ${book.narratorText}.",
                        book.id
                    )
                }
            } catch (e: Exception) {
                // Ignore parse errors
            }
        }

        return Result.success()
    }
}
