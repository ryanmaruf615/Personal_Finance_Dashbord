package com.financeapp.service;

import com.financeapp.config.JwtService;
import com.financeapp.dto.request.LoginRequest;
import com.financeapp.dto.request.RegisterRequest;
import com.financeapp.dto.response.AuthResponse;
import com.financeapp.entity.User;
import com.financeapp.enums.Currency;
import com.financeapp.enums.Role;
import com.financeapp.exception.DuplicateResourceException;
import com.financeapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        // Set the @Value field via reflection
        ReflectionTestUtils.setField(authService, "accessTokenExpiration", 900000L);

        testUser = User.builder()
                .id(1L)
                .email("test@test.com")
                .password("$2a$10$hashedPassword")
                .firstName("John")
                .lastName("Doe")
                .role(Role.ROLE_USER)
                .preferredCurrency(Currency.EUR)
                .createdAt(LocalDateTime.now())
                .build();

        registerRequest = RegisterRequest.builder()
                .email("test@test.com")
                .password("password123")
                .firstName("John")
                .lastName("Doe")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@test.com")
                .password("password123")
                .build();
    }

    // ─── Register Tests ─────────────────────────────────────────────

    @Test
    @DisplayName("Should register user with hashed password")
    void shouldRegisterWithHashedPassword() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getUser().getEmail()).isEqualTo("test@test.com");
        assertThat(response.getUser().getRole()).isEqualTo(Role.ROLE_USER);

        // Verify password was encoded
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("$2a$10$hashedPassword");

        // Verify raw password was never saved
        assertThat(userCaptor.getValue().getPassword()).isNotEqualTo("password123");
    }

    @Test
    @DisplayName("Should reject duplicate email on register")
    void shouldRejectDuplicateEmail() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When / Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("email");

        // Verify user was never saved
        verify(userRepository, never()).save(any(User.class));
    }

    // ─── Login Tests ────────────────────────────────────────────────

    @Test
    @DisplayName("Should return tokens on successful login")
    void shouldReturnTokensOnLogin() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(testUser, null));
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(testUser)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(testUser)).thenReturn("refresh-token");

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getExpiresIn()).isEqualTo(900);
        assertThat(response.getUser().getEmail()).isEqualTo("test@test.com");

        // Verify authentication was attempted
        verify(authenticationManager).authenticate(
                argThat(auth ->
                        auth.getPrincipal().equals("test@test.com") &&
                        auth.getCredentials().equals("password123")
                )
        );
    }

    @Test
    @DisplayName("Should throw on wrong password")
    void shouldThrowOnWrongPassword() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // When / Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);

        // Verify user was never looked up after failed auth
        verify(userRepository, never()).findByEmail(anyString());
    }
}
