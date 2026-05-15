package com.homemate.api.service;

import com.homemate.api.domain.User;
import com.homemate.api.dto.RegisterRequest;
import com.homemate.api.repository.UserRepository;
import com.homemate.api.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_ShouldSaveUser_WhenEmailIsNotTaken() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");
        request.setPassword("password");
        request.setFirstName("Test");
        request.setLastName("User");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(jwtUtils.generateToken(request.getEmail())).thenReturn("mockToken");
        
        User mockSavedUser = new User();
        mockSavedUser.setId(1L);
        mockSavedUser.setEmail(request.getEmail());
        when(userRepository.save(any(User.class))).thenReturn(mockSavedUser);

        // Act
        var response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("mockToken", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailIsTaken() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(new User()));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Bu email adresi zaten kullanılıyor.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
