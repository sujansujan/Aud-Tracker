package com.audiotracker.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Dracula Dark Theme Colors
private val DraculaBackground = Color(0xFF282A36)
private val DraculaSurface = Color(0xFF21222C)
private val DraculaPrimary = Color(0xFFBD93F9) // Purple
private val DraculaSecondary = Color(0xFFFF79C6) // Pink
private val DraculaTertiary = Color(0xFF8BE9FD) // Cyan
private val DraculaAccentYellow = Color(0xFFF1FA8C) // Yellow
private val DraculaAccentGreen = Color(0xFF50FA7B) // Green
private val DraculaAccentOrange = Color(0xFFFFB86C) // Orange
private val DraculaOnSurface = Color(0xFFF8F8F2)

// Alucard Light Theme Colors
private val AlucardBackground = Color(0xFFF9F7FA)
private val AlucardSurface = Color(0xFFFFFFFF)
private val AlucardPrimary = Color(0xFF6B3BA7)
private val AlucardSecondary = Color(0xFFC026D3)
private val AlucardOnSurface = Color(0xFF1E1A29)

private val DarkColorScheme = darkColorScheme(
    primary = DraculaPrimary,
    onPrimary = Color(0xFF1E1A29),
    primaryContainer = Color(0xFF44475A),
    onPrimaryContainer = DraculaOnSurface,
    secondary = DraculaSecondary,
    background = DraculaBackground,
    surface = DraculaSurface,
    onSurface = DraculaOnSurface
)

private val LightColorScheme = lightColorScheme(
    primary = AlucardPrimary,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFF3E8FF),
    onPrimaryContainer = AlucardPrimary,
    secondary = AlucardSecondary,
    background = AlucardBackground,
    surface = AlucardSurface,
    onSurface = AlucardOnSurface
)

@Composable
fun AudibleTrackerTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
