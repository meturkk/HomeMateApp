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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdServiceTest {

    @Mock
    private AdRepository adRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CityRepository cityRepository;
    @Mock
    private DistrictRepository districtRepository;

    @InjectMocks
    private AdService adService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createAd_ShouldSaveAd_WhenValidDataProvided() {
        // Arrange
        String ownerEmail = "test@test.com";
        AdDto adDto = new AdDto();
        adDto.setTitle("Güzel Ev");
        adDto.setPrice(15000.0);
        adDto.setCityId(1L);
        adDto.setDistrictId(1L);

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail(ownerEmail);

        City mockCity = new City();
        mockCity.setId(1L);
        mockCity.setName("Ankara");

        District mockDistrict = new District();
        mockDistrict.setId(1L);
        mockDistrict.setName("Çankaya");

        when(userRepository.findByEmail(ownerEmail)).thenReturn(Optional.of(mockUser));
        when(cityRepository.findById(1L)).thenReturn(Optional.of(mockCity));
        when(districtRepository.findById(1L)).thenReturn(Optional.of(mockDistrict));
        
        Ad savedAd = new Ad();
        savedAd.setId(100L);
        savedAd.setOwner(mockUser);
        savedAd.setCity(mockCity);
        savedAd.setDistrict(mockDistrict);
        savedAd.setTitle(adDto.getTitle());
        savedAd.setPrice(adDto.getPrice());

        when(adRepository.save(any(Ad.class))).thenReturn(savedAd);

        // Act
        AdDto result = adService.createAd(adDto, null, ownerEmail);

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("Ankara", result.getCityName());
        verify(adRepository, times(1)).save(any(Ad.class));
    }
}
