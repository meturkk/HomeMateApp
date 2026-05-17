package com.homemate.api.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdDto {
    private Long id;
    private Long ownerId;
    private String title;
    private String description;
    private Double price;
    private Long cityId;
    private String cityName;
    private Long districtId;
    private String districtName;
    private String neighborhood;

    // --- Yeni ilan bilgileri ---
    private Integer squareMeters;
    private String roomCount;
    private String heatingType;
    private Integer bathroomCount;
    private Integer currentResidents;
    private Integer totalCapacity;
    private Boolean hasBalcony;
    private Integer floorNumber;
    private Boolean hasElevator;
    private Boolean hasParking;
    private Boolean inComplex;

    private List<String> photoUrls;
    private LocalDateTime createdAt;
}
