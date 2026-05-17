package com.homemate.api.service;

import com.homemate.api.domain.User;
import com.homemate.api.dto.UserDto;
import com.homemate.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

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
        Integer personaId = aiIntegrationService.getPersonaId(answers);

        if (personaId == null) {
            throw new RuntimeException("Yapay zeka testi sonuçlandırılamadı.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));
        user.setPersonaId(personaId);
        userRepository.save(user);

        return personaId;
    }

    // Test cevaplarını AI'a gönderir, PersonaID + Big Five skorlarını döndürür
    public Map<String, Object> submitTestAndGetAnalysis(Map<String, Integer> answers, String userEmail) {
        Map<String, Object> aiResult = aiIntegrationService.analyzePersonality(answers);

        if (aiResult == null || !aiResult.containsKey("persona_id")) {
            throw new RuntimeException("Yapay zeka testi sonuçlandırılamadı. AI servisi çalışıyor mu?");
        }

        Integer personaId = (Integer) aiResult.get("persona_id");

        // Kullanıcının persona ID'sini veritabanına kaydet
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));
        user.setPersonaId(personaId);
        userRepository.save(user);

        return aiResult;
    }

    public Map<String, Object> getPersonaDetails(int personaId) {
        Map<String, Object> result = aiIntegrationService.getPersonaDetails(personaId);
        if (result == null) {
            throw new RuntimeException("Kişilik profili detayları çekilemedi. AI servisi çalışıyor mu?");
        }
        return result;
    }

    // --- ME METOTLARI ---
    public UserDto getMe(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return mapUserToDto(user);
    }

    private final String UPLOAD_DIR = "uploads/";

    public UserDto uploadProfilePicture(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Lütfen geçerli bir dosya seçin.");
        }
        
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            String fileUrl = "http://localhost:8080/uploads/" + fileName;
            user.setProfilePictureUrl(fileUrl);
            userRepository.save(user);
            
            return mapUserToDto(user);
        } catch (Exception e) {
            throw new RuntimeException("Profil fotoğrafı yüklenirken hata oluştu: " + e.getMessage());
        }
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

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return mapUserToDto(user);
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
