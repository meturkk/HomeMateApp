package com.homemate.api.controller;

import com.homemate.api.dto.AdDto;
import com.homemate.api.service.AdService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ads")
public class AdController {

    private final AdService adService;

    public AdController(AdService adService) {
        this.adService = adService;
    }

    @GetMapping
    public ResponseEntity<List<AdDto>> getAllAds() {
        return ResponseEntity.ok(adService.getAllAds());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdDto> getAdById(@PathVariable Long id) {
        return ResponseEntity.ok(adService.getAdById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<AdDto> createAd(
            @RequestPart("ad") String adJson,
            @RequestPart(value = "files", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> files,
            Authentication authentication) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            AdDto adDto = mapper.readValue(adJson, AdDto.class);
            return ResponseEntity.ok(adService.createAd(adDto, files, authentication.getName()));
        } catch (Exception e) {
            throw new RuntimeException("Geçersiz ilan verisi: " + e.getMessage());
        }
    }

    // --- ADMIN ENDPOINT'LERİ ---
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateAd(@PathVariable Long id) {
        return ResponseEntity.ok(adService.deactivateAd(id));
    }
}
