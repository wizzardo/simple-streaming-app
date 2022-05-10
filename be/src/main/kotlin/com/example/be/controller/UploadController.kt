package com.example.be.controller

import com.example.be.service.UploadService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
class UploadController(
    private val uploadService: UploadService,
) {
    @PostMapping("/upload")
    fun upload(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("artistId", required = false) artistId: Long?,
        @RequestParam("albumId", required = false) albumId: String?,
    ): ResponseEntity<Any> {
        return uploadService.upload(file, artistId, albumId)
    }

}
