package com.homemate.api.service;

import com.homemate.api.domain.Ad;
import com.homemate.api.domain.City;
import com.homemate.api.domain.District;
import com.homemate.api.domain.User;
import com.homemate.api.dto.AdDto;
import com.homemate.api.repository.AdRepository;
import com.homemate.api.repository.CityRepository;
import com.homemate.api.repository.DistrictRepository;
import com.homemate.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdService {

    private final AdRepository adRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final DistrictRepository districtRepository;

    public AdService(AdRepository adRepository, UserRepository userRepository,
                     CityRepository cityRepository, DistrictRepository districtRepository) {
        this.adRepository = adRepository;
        this.userRepository = userRepository;
        this.cityRepository = cityRepository;
        this.districtRepository = districtRepository;
    }

    public List<AdDto> getAllAds() {
        return adRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public AdDto createAd(AdDto adDto, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));
        City city = cityRepository.findById(adDto.getCityId())
                .orElseThrow(() -> new RuntimeException("İl bulunamadı."));
        District district = districtRepository.findById(adDto.getDistrictId())
                .orElseThrow(() -> new RuntimeException("İlçe bulunamadı."));

        Ad ad = new Ad();
        ad.setOwner(owner);
        ad.setTitle(adDto.getTitle());
        ad.setDescription(adDto.getDescription());
        ad.setPrice(adDto.getPrice());
        ad.setCity(city);
        ad.setDistrict(district);
        ad.setPhotoUrls(adDto.getPhotoUrls());
        ad.setCreatedAt(LocalDateTime.now());

        Ad savedAd = adRepository.save(ad);
        return mapToDto(savedAd);
    }

    private AdDto mapToDto(Ad ad) {
        AdDto dto = new AdDto();
        dto.setId(ad.getId());
        dto.setOwnerId(ad.getOwner().getId());
        dto.setTitle(ad.getTitle());
        dto.setDescription(ad.getDescription());
        dto.setPrice(ad.getPrice());
        dto.setCityId(ad.getCity().getId());
        dto.setCityName(ad.getCity().getName());
        dto.setDistrictId(ad.getDistrict().getId());
        dto.setDistrictName(ad.getDistrict().getName());
        dto.setPhotoUrls(ad.getPhotoUrls());
        dto.setCreatedAt(ad.getCreatedAt());
        return dto;
    }

    // --- ADMIN METOTLARI ---
    public String deactivateAd(Long id) {
        Ad ad = adRepository.findById(id).orElseThrow(() -> new RuntimeException("İlan bulunamadı"));
        ad.setActive(false);
        adRepository.save(ad);
        return "İlan başarıyla yayından kaldırıldı (Soft Delete).";
    }
}
