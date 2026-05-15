package com.homemate.api.service;

import com.homemate.api.domain.User;
import com.homemate.api.dto.UserDto;
import com.homemate.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AiIntegrationService aiIntegrationService;

    public UserService(UserRepository userRepository, AiIntegrationService aiIntegrationService) {
        this.userRepository = userRepository;
        this.aiIntegrationService = aiIntegrationService;
    }

    // Testi çözen kullanıcının cevaplarını AI'a gönderir ve PersonaID'yi veritabanına kaydeder
    public Integer submitTestAndAssignPersona(Map<String, Integer> answers, String userEmail) {
        // 1. Python'dan cluster ID'yi al
        Integer personaId = aiIntegrationService.getPersonaId(answers);

        if (personaId == null) {
            throw new RuntimeException("Yapay zeka testi sonuçlandırılamadı.");
        }

        // 2. Kullanıcıyı bul ve veritabanını güncelle
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));
        user.setPersonaId(personaId);
        userRepository.save(user);

        return personaId;
    }

    // --- ADMIN METOTLARI ---

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapUserToDto).collect(Collectors.toList());
    }

    public String deactivateUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        user.setActive(false);
        userRepository.save(user);
        return "Kullanıcı başarıyla askıya alındı (Soft Delete).";
    }

    private UserDto mapUserToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setPersonaId(user.getPersonaId());
        return dto;
    }
}
