package com.skribl.auth;

import com.skribl.auth.dto.AuthResponse;
import com.skribl.auth.dto.LoginRequest;
import com.skribl.auth.dto.RegisterRequest;
import com.skribl.auth.dto.UserResponse;
import com.skribl.security.JwtService;
import com.skribl.user.User;
import com.skribl.user.UserRepository;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String emailRaw = request.getEmail().trim();
        String emailNormalized = emailRaw.toLowerCase(Locale.ROOT);

        // Basic checks
        if (username.isBlank() || emailNormalized.isBlank() || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Missing required fields");
        }
        if (username.length() < 3 || username.length() > 30) {
            throw new IllegalArgumentException("Username must be between 3 and 30 characters");
        }
        if (request.getPassword().length() < 8 || request.getPassword().length() > 128) {
            throw new IllegalArgumentException("Password must be between 8 and 128 characters");
        }
        // Email format checked by validation; also normalize

        if (userRepository.existsByUsername(username) || userRepository.existsByEmailNormalized(emailNormalized)) {
            throw new DataIntegrityViolationException("Duplicate");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmailNormalized(emailNormalized);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        try {
            User saved = userRepository.save(user);
            return new UserResponse(saved.getId(), saved.getUsername(), saved.getEmailNormalized());
        } catch (DataIntegrityViolationException ex) {
            // Handle concurrent duplicates
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String emailRaw = request.getEmail().trim();
        String emailNormalized = emailRaw.toLowerCase(Locale.ROOT);
        // Generic response to avoid user enumeration
        var userOpt = userRepository.findByEmailNormalized(emailNormalized);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = jwtService.generateToken(user.getId(), user.getUsername());
        return new AuthResponse(token, new UserResponse(user.getId(), user.getUsername(), user.getEmailNormalized()));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(java.util.UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return new UserResponse(user.getId(), user.getUsername(), user.getEmailNormalized());
    }
}
