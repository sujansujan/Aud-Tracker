package com.audiotracker.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.audiotracker.app.model.Audiobook
import com.audiotracker.app.model.Genre
import com.audiotracker.app.model.SeriesInfo
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddBookDialog(
    isOpen: Boolean,
    onDismiss: () -> Unit,
    onAddBook: (Audiobook) -> Unit
) {
    if (!isOpen) return

    var title by remember { mutableStateOf("") }
    var author by remember { mutableStateOf("") }
    var seriesName by remember { mutableStateOf("") }
    var seriesNumber by remember { mutableStateOf("") }
    var narrator by remember { mutableStateOf("") }
    var releaseDate by remember { mutableStateOf("2026-10-15") }
    var coverUrl by remember { mutableStateOf("") }
    var selectedGenre by remember { mutableStateOf(Genre.SCI_FI) }
    var synopsis by remember { mutableStateOf("") }
    var runtimeHours by remember { mutableStateOf("12.5") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(28.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Add Audiobook",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Title Input
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Book Title *") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Author Input
                OutlinedTextField(
                    value = author,
                    onValueChange = { author = it },
                    label = { Text("Author *") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Series Info
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = seriesName,
                        onValueChange = { seriesName = it },
                        label = { Text("Series Name (optional)") },
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(2f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = seriesNumber,
                        onValueChange = { seriesNumber = it },
                        label = { Text("Book #") },
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Narrator Input
                OutlinedTextField(
                    value = narrator,
                    onValueChange = { narrator = it },
                    label = { Text("Narrator(s)") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Release Date (YYYY-MM-DD)
                OutlinedTextField(
                    value = releaseDate,
                    onValueChange = { releaseDate = it },
                    label = { Text("Release Date (YYYY-MM-DD)") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Cover Image URL
                OutlinedTextField(
                    value = coverUrl,
                    onValueChange = { coverUrl = it },
                    label = { Text("Cover Image URL (optional)") },
                    placeholder = { Text("https://...") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Synopsis
                OutlinedTextField(
                    value = synopsis,
                    onValueChange = { synopsis = it },
                    label = { Text("Synopsis / Blurb") },
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Submit Button
                Button(
                    onClick = {
                        if (title.isNotBlank() && author.isNotBlank()) {
                            val newBook = Audiobook(
                                id = "book-" + UUID.randomUUID().toString().take(8),
                                title = title.trim(),
                                author = author.trim(),
                                series = if (seriesName.isNotBlank()) SeriesInfo(seriesName.trim(), seriesNumber.trim()) else null,
                                narrators = if (narrator.isNotBlank()) listOf(narrator.trim()) else listOf("Audible Cast"),
                                releaseDate = releaseDate.trim(),
                                coverUrl = if (coverUrl.isNotBlank()) coverUrl.trim() else "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
                                runtimeHours = runtimeHours.toDoubleOrNull() ?: 10.0,
                                genre = selectedGenre,
                                synopsis = if (synopsis.isNotBlank()) synopsis.trim() else "Tracked audiobook release on Audible."
                            )
                            onAddBook(newBook)
                            onDismiss()
                        }
                    },
                    enabled = title.isNotBlank() && author.isNotBlank(),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                ) {
                    Text("Add to My Tracker", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        }
    }
}
