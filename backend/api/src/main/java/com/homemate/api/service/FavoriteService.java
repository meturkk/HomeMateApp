package com.homemate.api.service;

import com.homemate.api.domain.Ad;
import com.homemate.api.domain.Favorite;
import com.homemate.api.domain.User;
import com.homemate.api.dto.AdDto;
import com.homemate.api.repository.AdRepository;
import com.homemate.api.repository.FavoriteRepository;
import com.homemate.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final AdRepository adRepository;
    private final AdService adService;

    public FavoriteService(FavoriteRepository favoriteRepository, UserRepository userRepository, AdRepository adRepository, AdService adService) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.adRepository = adRepository;
        this.adService = adService;
    }

    /**
     * İlanı favorilere ekle veya zaten favorideyse çıkar (toggle).
     * @return true: eklendi, false: çıkarıldı
     */
    public boolean toggleFavorite(String email, Long adId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new RuntimeException("İlan bulunamadı"));

        Optional<Favorite> existing = favoriteRepository.findByUserIdAndAdId(user.getId(), adId);

        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return false; // Favoriden çıkarıldı
        } else {
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setAd(ad);
            favoriteRepository.save(favorite);
            return true; // Favoriye eklendi
        }
    }

    /**
     * Kullanıcının favori ilanlarının ID listesini döndürür.
     */
    public List<Long> getFavoriteAdIds(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return favoriteRepository.findByUserId(user.getId()).stream()
                .map(fav -> fav.getAd().getId())
                .collect(Collectors.toList());
    }

    /**
     * Kullanıcının favori ilanlarını AdDto listesi olarak döndürür.
     */
    public List<AdDto> getFavoriteAds(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return favoriteRepository.findByUserId(user.getId()).stream()
                .map(fav -> adService.getAdById(fav.getAd().getId()))
                .collect(Collectors.toList());
    }
}
