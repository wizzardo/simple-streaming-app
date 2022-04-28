package com.example.be.controller

import com.example.be.db.dto.ArtistDto
import com.example.be.service.ArtistService
import com.example.be.service.FFmpegService
import com.example.be.service.SongService
import com.example.be.service.UploadService
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
class UploadController(
    private val uploadService: UploadService,
    private val artistService: ArtistService,
    private val songService: SongService,
    private val ffmpegService: FFmpegService,
) {

    @PostMapping("/upload")
    fun upload(
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<Any> = uploadService.upload(file)

    @GetMapping("/artists")
    fun getArtists(): List<ArtistDto> = artistService.getArtists()

    @GetMapping("/artists/{artistId}/{albumName}/{trackNumber}")
    fun getSong(
        @PathVariable artistId: Long,
        @PathVariable albumName: String,
        @PathVariable trackNumber: Int,
    ): ResponseEntity<ByteArray> {
        val song = songService.getSong(artistId, albumName, trackNumber)
        val songData = songService.getSongData(song)
        val type = AudioFormat.values().find { song.path.endsWith(it.name, true) }?.mimeType
        val headers = HttpHeaders().apply { this.contentType = MediaType.parseMediaType(type ?: "application/octet-stream") }
        return ResponseEntity(songData, headers, HttpStatus.OK)
    }

    enum class AudioFormat(val mimeType: String) {
        MP3("audio/mpeg"),
        AAC("audio/aac"),
        OGG("audio/ogg"),
        OPUS("audio/opus"),
        FLAC("audio/x-flac");
    }

    @GetMapping("/artists/{artistId}/{albumName}/{trackNumber}/{format}/{bitrate}")
    fun getSongConverted(
        @PathVariable artistId: Long,
        @PathVariable albumName: String,
        @PathVariable trackNumber: Int,
        @PathVariable format: AudioFormat,
        @PathVariable bitrate: Int,
    ): ResponseEntity<ByteArray> {
        val song = songService.getSong(artistId, albumName, trackNumber)
        val data = ffmpegService.convert(song, format, bitrate)
        val headers = HttpHeaders().apply { this.contentType = MediaType.parseMediaType(format.mimeType) }
        return ResponseEntity(data, headers, HttpStatus.OK)
    }
}
