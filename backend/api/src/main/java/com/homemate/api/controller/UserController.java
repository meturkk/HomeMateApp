package com.homemate.api.controller;

import com.homemate.api.dto.UserDto;
import com.homemate.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/submit-test")
    public ResponseEntity<?> submitTest(@RequestBody Map<String, Integer> answers, Authentication authentication) {
        try {
            Map<String, Object> result = userService.submitTestAndGetAnalysis(answers, authentication.getName());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/persona/{personaId}")
    public ResponseEntity<?> getPersonaDetails(@PathVariable int personaId) {
        try {
            Map<String, Object> result = userService.getPersonaDetails(personaId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(Authentication authentication) {
        return ResponseEntity.ok(userService.getMe(authentication.getName()));
    }

    @PostMapping(value = "/profile-picture", consumes = {"multipart/form-data"})
    public ResponseEntity<UserDto> uploadProfilePicture(
            @RequestPart("file") org.springframework.web.multipart.MultipartFile file,
            Authentication authentication) {
        return ResponseEntity.ok(userService.uploadProfilePicture(authentication.getName(), file));
    }

    // --- ADMIN ENDPOINT'LERİ ---
    
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }
}
