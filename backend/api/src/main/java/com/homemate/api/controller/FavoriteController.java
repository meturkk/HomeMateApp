package com.homemate.api.controller;

import com.homemate.api.dto.AdDto;
import com.homemate.api.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    /**
     * İlanı favorilere ekle veya çıkar (toggle).
     */
    @PostMapping("/{adId}")
    public ResponseEntity<Map<String, Object>> toggleFavorite(@PathVariable Long adId, Authentication authentication) {
        boolean added = favoriteService.toggleFavorite(authentication.getName(), adId);
        return ResponseEntity.ok(Map.of(
            "favorited", added,
            "message", added ? "İlan favorilere eklendi." : "İlan favorilerden çıkarıldı."
        ));
    }

    /**
     * Kullanıcının favori ilan ID'lerini döndürür (hızlı kontrol için).
     */
    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getFavoriteIds(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getFavoriteAdIds(authentication.getName()));
    }

    /**
     * Kullanıcının favori ilanlarını döndürür (profil sayfası için).
     */
    @GetMapping
    public ResponseEntity<List<AdDto>> getFavoriteAds(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getFavoriteAds(authentication.getName()));
    }
}
