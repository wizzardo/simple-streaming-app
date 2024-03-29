package com.example.be.service

import com.example.be.db.model.Artist
import com.example.be.db.model.Artist.Album
import com.example.be.misc.TempFileInputStream
import com.wizzardo.tools.image.ImageTools
import com.wizzardo.tools.io.IOTools
import com.wizzardo.tools.misc.Stopwatch
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

class SongService(
    private val artistService: ArtistService,
    private val songsStorageService: SongsStorageService,
) {

    fun getSongData(artist: Artist, album: Album, song: Album.Song): File {
        val tempFile = File.createTempFile("song", song.path)
        val stopwatch = Stopwatch("downloaded ${artist.name} ${album.name} ${song.title}")
        songsStorageService.getStream(artist, album, song).use { inputStream ->
            FileOutputStream(tempFile).use { outputStream ->
                IOTools.copy(inputStream, outputStream)
            }
        }
        println(stopwatch)
        return tempFile
    }

    fun getSong(artistId: Long, albumName: String, trackNumber: Int): Album.Song {
        val artist: Artist = artistService.findById(artistId) ?: throw IllegalArgumentException("can't find artist with id: $artistId")
        val album: Album = artist.albums.find { album -> album.name == albumName } ?: throw IllegalArgumentException("can't find album with name: $albumName")
        val song: Album.Song = album.songs.find { song -> song.track == trackNumber } ?: throw IllegalArgumentException("can't find song with trackNumber: $trackNumber")
        return song
    }

    fun getAlbum(artistId: Long, albumName: String): Album {
        val artist: Artist = artistService.findById(artistId) ?: throw IllegalArgumentException("can't find artist with id: $artistId")
        val album: Album = artist.albums.find { album -> album.name == albumName } ?: throw IllegalArgumentException("can't find album with name: $albumName")
        return album
    }

    fun getAlbum(artist: Artist, albumIdOrPath: String): Album? {
        return artist.albums.find { album -> album.path == albumIdOrPath || album.id == albumIdOrPath }
    }

    fun copySongData(artist: Artist, album: Album, song: Album.Song, tempFile: File) {
        val stopwatch = Stopwatch("downloaded ${artist.name} ${album.name} ${song.title}")
        songsStorageService.getStream(artist, album, song).use { inputStream ->
            FileOutputStream(tempFile).use { outputStream ->
                IOTools.copy(inputStream, outputStream)
            }
        }
        println(stopwatch)
    }

    fun copySongStream(artist: Artist, album: Album, song: Album.Song): InputStream {
        return songsStorageService.getStream(artist, album, song)
    }

    fun getAlbumCoverData(artist: Artist, album: Album): TempFileInputStream {
        val tempFile = File.createTempFile("cover", ".jpg")
        var delete = true
        var stopwatch = Stopwatch("get and decrypt image")
        songsStorageService.getCoverAsStream(artist, album).use { inputStream ->
            FileOutputStream(tempFile).use { outputStream ->
                IOTools.copy(inputStream, outputStream)
            }
        }
        println(stopwatch)

        try {
            stopwatch = Stopwatch("read image")
            var image = ImageTools.read(tempFile)
            println(stopwatch)
            image = ImageTools.resizeToFit(image, 512, 512)

            stopwatch = Stopwatch("save image")
            ImageTools.saveJPG(image, tempFile, 90)
            println(stopwatch)

            delete = false
            return TempFileInputStream(tempFile)
//            return FileTools.bytes(tempFile)
        } finally {
            if (delete)
                tempFile.delete()
        }

//        return storageService.getData("${artistPath}/${albumPath}/cover.jpg")
    }
}
