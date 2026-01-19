package com.portfolio.backend.controller;

import com.portfolio.backend.entity.User;
import com.portfolio.backend.payload.JwtResponse;
import com.portfolio.backend.payload.LoginRequest;
import com.portfolio.backend.payload.SignupRequest;
import com.portfolio.backend.repository.UserRepository;
import com.portfolio.backend.security.JwtUtils;
import com.portfolio.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    com.portfolio.backend.service.NotificationService notificationService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(loginRequest.getEmail());

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getName()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        User savedUser = userRepository.save(user);
        
        // Send Welcome Notification
        try {
            notificationService.createNotification(savedUser.getId(), "SUCCESS", "Welcome to Cryptofolio! Your journey starts here.");
            notificationService.createNotification(savedUser.getId(), "INFO", "Tip: Connect your exchange API keys in Settings to track your portfolio.");
        } catch (Exception e) {
            System.err.println("Failed to send welcome notification: " + e.getMessage());
        }

        return ResponseEntity.ok("User registered successfully!");
    }
}
