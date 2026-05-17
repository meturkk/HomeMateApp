package com.homemate.api.controller;

import com.homemate.api.dto.LocationDto;
import com.homemate.api.repository.CityRepository;
import com.homemate.api.repository.DistrictRepository;
import com.homemate.api.repository.NeighborhoodRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final CityRepository cityRepository;
    private final DistrictRepository districtRepository;
    private final NeighborhoodRepository neighborhoodRepository;

    public LocationController(CityRepository cityRepository,
                              DistrictRepository districtRepository,
                              NeighborhoodRepository neighborhoodRepository) {
        this.cityRepository = cityRepository;
        this.districtRepository = districtRepository;
        this.neighborhoodRepository = neighborhoodRepository;
    }

    /**
     * Tüm şehirleri (illeri) alfabetik sıralı getirir.
     */
    @GetMapping("/cities")
    public ResponseEntity<List<LocationDto>> getAllCities() {
        List<LocationDto> cities = cityRepository.findAll()
                .stream()
                .map(c -> new LocationDto(c.getId(), c.getName()))
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(cities);
    }

    /**
     * Belirtilen şehre ait ilçeleri alfabetik sıralı getirir.
     */
    @GetMapping("/cities/{cityId}/districts")
    public ResponseEntity<List<LocationDto>> getDistrictsByCity(@PathVariable Long cityId) {
        List<LocationDto> districts = districtRepository.findByCityId(cityId)
                .stream()
                .map(d -> new LocationDto(d.getId(), d.getName()))
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(districts);
    }

    /**
     * Belirtilen ilçeye ait mahalleleri alfabetik sıralı getirir.
     */
    @GetMapping("/districts/{districtId}/neighborhoods")
    public ResponseEntity<List<LocationDto>> getNeighborhoodsByDistrict(@PathVariable Long districtId) {
        List<LocationDto> neighborhoods = neighborhoodRepository.findByDistrictIdOrderByNameAsc(districtId)
                .stream()
                .map(n -> new LocationDto(n.getId(), n.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(neighborhoods);
    }
}
