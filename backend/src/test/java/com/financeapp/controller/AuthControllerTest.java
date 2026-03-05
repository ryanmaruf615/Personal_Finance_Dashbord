package com.financeapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financeapp.dto.request.LoginRequest;
import com.financeapp.dto.request.RegisterRequest;
import com.financeapp.dto.response.AuthResponse;
import com.financeapp.dto.response.UserResponse;
import com.financeapp.enums.Currency;
import com.financeapp.enums.Role;
import com.financeapp.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController Unit Tests")
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        authResponse = AuthResponse.builder()
                .accessToken("test-access-token")
                .refreshToken("test-refresh-token")
                .expiresIn(900)
                .user(UserResponse.builder()
                        .id(1L)
                        .email("test@test.com")
                        .firstName("John")
                        .lastName("Doe")
                        .role(Role.ROLE_USER)
                        .preferredCurrency(Currency.EUR)
                        .createdAt(LocalDateTime.now())
                        .build())
                .build();
    }

    @Test
    @DisplayName("Should return 201 on successful register")
    void shouldReturn201OnRegister() {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@test.com")
                .password("password123")
                .firstName("John")
                .lastName("Doe")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getAccessToken()).isEqualTo("test-access-token");
        assertThat(response.getBody().getRefreshToken()).isEqualTo("test-refresh-token");
        assertThat(response.getBody().getExpiresIn()).isEqualTo(900);
        assertThat(response.getBody().getUser().getEmail()).isEqualTo("test@test.com");
        assertThat(response.getBody().getUser().getRole()).isEqualTo(Role.ROLE_USER);
    }

    @Test
    @DisplayName("Should return 400 when register request has invalid data")
    void shouldReturn400OnInvalid() {
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .email("")
                .password("short")
                .firstName("")
                .lastName("")
                .build();

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new IllegalArgumentException("Validation failed"));

        assertThatThrownBy(() -> authController.register(invalidRequest))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Should return 200 on successful login")
    void shouldReturn200OnLogin() {
        LoginRequest request = LoginRequest.builder()
                .email("test@test.com")
                .password("password123")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getAccessToken()).isEqualTo("test-access-token");
        assertThat(response.getBody().getUser().getEmail()).isEqualTo("test@test.com");
    }

    @Test
    @DisplayName("Should throw 401 on bad credentials")
    void shouldReturn401OnBadCredentials() {
        LoginRequest request = LoginRequest.builder()
                .email("test@test.com")
                .password("wrongpassword")
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authController.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Bad credentials");
    }
}