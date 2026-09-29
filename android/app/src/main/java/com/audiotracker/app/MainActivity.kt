package com.audiotracker.app

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import com.audiotracker.app.data.AudiobookRepository
import com.audiotracker.app.service.AudibleNotificationService
import com.audiotracker.app.ui.screens.HomeScreen
import com.audiotracker.app.ui.theme.AudibleTrackerTheme

class MainActivity : ComponentActivity() {

    private val repository = AudiobookRepository()
    private lateinit var notificationService: AudibleNotificationService

    private val requestNotificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
            if (isGranted) {
                notificationService.postReleaseNotification(
                    1001,
                    "Audible Release Alerts Active",
                    "You will receive native Android status bar alerts for upcoming audiobook releases!"
                )
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        notificationService = AudibleNotificationService(this)

        // Request native Android 13+ POST_NOTIFICATIONS permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }

        setContent {
            var isDarkTheme by remember { mutableStateOf(false) }

            AudibleTrackerTheme(darkTheme = isDarkTheme) {
                HomeScreen(
                    repository = repository,
                    isDarkTheme = isDarkTheme,
                    onToggleTheme = { isDarkTheme = !isDarkTheme }
                )
            }
        }
    }
}
