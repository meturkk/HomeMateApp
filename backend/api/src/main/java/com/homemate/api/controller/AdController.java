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

    @PostMapping
    public ResponseEntity<AdDto> createAd(@RequestBody AdDto adDto, Authentication authentication) {
        return ResponseEntity.ok(adService.createAd(adDto, authentication.getName()));
    }

    // --- ADMIN ENDPOINT'LERİ ---
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateAd(@PathVariable Long id) {
        return ResponseEntity.ok(adService.deactivateAd(id));
    }
}
