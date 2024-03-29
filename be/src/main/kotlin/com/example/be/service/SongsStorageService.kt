package com.example.be.service

import com.example.be.db.model.Artist
import com.example.be.db.model.Artist.Album
import com.example.be.db.model.Artist.Album.Song
import com.wizzardo.tools.misc.Unchecked
import com.wizzardo.tools.security.AES
import com.wizzardo.tools.security.Base64
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream
import java.security.spec.AlgorithmParameterSpec
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.spec.IvParameterSpec

class SongsStorageService(
    private val useIdAsName: Boolean,
    val encryption: Boolean,
    val storageService: StorageService,
) {

    private val keyGenerator: KeyGenerator

    init {
        keyGenerator = KeyGenerator.getInstance("AES")
        keyGenerator.init(128)
    }

    private fun Artist.path(): String {
        if (useIdAsName)
            return this.id.toString()
        return this.path
    }

    private fun Album.path(): String {
        if (useIdAsName)
            return this.id
        return this.path
    }

    private fun Album.coverPath(): String? {
        if (useIdAsName)
            return this.id + ".bin"
        return this.coverPath
    }

    private fun Song.path(): String {
        if (useIdAsName)
            return this.id + ".bin"
        return this.path
    }

    fun createFolder(artist: Artist, album: Album) = storageService.createFolder("${artist.path()}/${album.path()}")

    fun createFolder(artist: Artist) = storageService.createFolder(artist.path())

    fun move(from: Artist, to: Artist, album: Album, song: Song) {
        storageService.move("${from.path()}/${album.path()}/${song.path()}", "${to.path()}/${album.path()}/${song.path()}")
    }

    fun move(from: Artist, albumFrom: Album, to: Artist, albumTo: Album, song: Song) {
        storageService.move("${from.path()}/${albumFrom.path()}/${song.path()}", "${to.path()}/${albumTo.path()}/${song.path()}")
    }

    fun move(from: Artist, albumFrom: Album, songFrom: Song, to: Artist, albumTo: Album, songTo: Song) {
        storageService.move("${from.path()}/${albumFrom.path()}/${songFrom.path()}", "${to.path()}/${albumTo.path()}/${songTo.path()}")
    }

    fun moveCover(from: Artist, to: Artist, album: Album) {
        storageService.move("${from.path()}/${album.path()}/${album.coverPath()}", "${to.path()}/${album.path()}/${album.coverPath()}")
    }

    fun moveCover(from: Artist, albumFrom: Album, to: Artist, albumTo: Album) {
        storageService.move("${from.path()}/${albumFrom.path()}/${albumFrom.coverPath()}", "${to.path()}/${albumTo.path()}/${albumTo.coverPath()}")
    }

    fun delete(artist: Artist) {
        artist.albums.forEach {
            delete(artist, it)
        }
        storageService.delete(artist.path())
    }

    fun delete(artist: Artist, album: Album) {
        album.songs.forEach {
            delete(artist, album, it)
        }

        if (album.coverPath != null)
            storageService.delete("${artist.path()}/${album.path()}/${album.coverPath()}")

        storageService.delete("${artist.path()}/${album.path()}")
    }

    fun delete(artist: Artist, album: Album, song: Song) {
        storageService.delete("${artist.path()}/${album.path()}/${song.path()}")
    }

    fun getStream(artist: Artist, album: Album, song: Song): InputStream {
        val stream = storageService.getStream("${artist.path()}/${album.path()}/${song.path()}")
        if (song.encryptionKey.isEmpty())
            return stream

        return decrypt(song.encryptionKey, stream)
    }

    fun getCoverAsStream(artist: Artist, album: Album): InputStream {
        val stream = storageService.getStream("${artist.path()}/${album.path()}/${album.coverPath()}")
        if (album.coverEncryptionKey.isNullOrEmpty())
            return stream

        return decrypt(album.coverEncryptionKey!!, stream)
    }

    fun put(artist: Artist, album: Album, song: Song, file: File) {
        if (song.encryptionKey.isNotEmpty()) {
            val tempFile = File.createTempFile("enc", "file")

            try {
                FileInputStream(file).use { input ->
                    FileOutputStream(tempFile).use { output ->
                        encrypt(song.encryptionKey, input, output)
                    }
                }

                storageService.put("${artist.path()}/${album.path()}/${song.path()}", tempFile)
            } catch (e: Exception) {
                e.printStackTrace()
                throw Unchecked.rethrow(e)
            } finally {
                tempFile.delete()
            }
        } else
            storageService.put("${artist.path()}/${album.path()}/${song.path()}", file)
    }

    fun putCover(artist: Artist, album: Album, bytes: ByteArray) {
        storageService.createFolder("${artist.path()}/${album.path()}")
        if (!album.coverEncryptionKey.isNullOrEmpty()) {
            val aes = AES(Base64.decodeFast(album.coverEncryptionKey, true))
            val encrypted = aes.encrypt(bytes)
            storageService.put("${artist.path()}/${album.path()}/${album.coverPath()}", encrypted)
        } else
            storageService.put("${artist.path()}/${album.path()}/${album.coverPath()}", bytes)
    }

    @Synchronized
    fun createEncryptionKey(): String {
        val key = keyGenerator.generateKey()
        return Base64.encodeToString(key.encoded, false, true)
    }

    fun decrypt(encryptionKey: String, inputStream: InputStream): InputStream {
        val key = AES.generateKey(Base64.decode(encryptionKey, true))
        val iv = key.encoded
        val paramSpec: AlgorithmParameterSpec = IvParameterSpec(iv)
        val cipher: Cipher = Cipher.getInstance("AES/CFB8/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key, paramSpec)

        val inputBuffer = ByteArray(1024)

        return object : InputStream() {
            override fun read(): Int {
                TODO("Not yet implemented")
            }

            override fun read(b: ByteArray, off: Int, len: Int): Int {
                val read = inputStream.read(inputBuffer, 0, Math.min(inputBuffer.size, len))
                if (read == -1)
                    return -1

                return cipher.update(inputBuffer, 0, read, b, off)
            }
        }
    }

    fun encrypt(encryptionKey: String, inputStream: InputStream, outputStream: OutputStream) {
        val key = AES.generateKey(Base64.decode(encryptionKey, true))
        val iv = key.encoded
        val paramSpec: AlgorithmParameterSpec = IvParameterSpec(iv)
        val cipher: Cipher = Cipher.getInstance("AES/CFB8/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key, paramSpec)


        val inputBuffer = ByteArray(1024)
        val outputBuffer = ByteArray(1024)
        var r: Int
        var encrypted: Int

        while (true) {
            r = inputStream.read(inputBuffer)
            if (r == -1)
                break

            encrypted = cipher.update(inputBuffer, 0, r, outputBuffer, 0)
            outputStream.write(outputBuffer, 0, encrypted)
        }
        encrypted = cipher.doFinal(outputBuffer, 0)
        if (encrypted > 0)
            outputStream.write(outputBuffer, 0, encrypted)
        outputStream.close()
    }

}