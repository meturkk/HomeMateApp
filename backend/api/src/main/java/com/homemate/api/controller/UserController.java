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
    public ResponseEntity<String> submitTest(@RequestBody Map<String, Integer> answers, Authentication authentication) {
        try {
            Integer personaId = userService.submitTestAndAssignPersona(answers, authentication.getName());
            return ResponseEntity.ok("Kişilik tipiniz başarıyla atandı: Persona " + personaId);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(Authentication authentication) {
        return ResponseEntity.ok(userService.getMe(authentication.getName()));
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
