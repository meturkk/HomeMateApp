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
    private List<String> photoUrls;
    private LocalDateTime createdAt;
}
