package com.homemate.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    private Integer personaId;
}
