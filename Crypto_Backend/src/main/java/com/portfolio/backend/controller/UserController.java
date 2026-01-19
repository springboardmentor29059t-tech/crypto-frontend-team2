package com.portfolio.backend.controller;

import com.portfolio.backend.entity.User;
import com.portfolio.backend.payload.UserProfileDto;
import com.portfolio.backend.repository.UserRepository;
import com.portfolio.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        UserProfileDto profileDto = new UserProfileDto();
        profileDto.setName(user.getName());
        profileDto.setEmail(user.getEmail());
        profileDto.setBinanceApiKey(user.getBinanceApiKey());
        // For security, you might want to mask this, but for now we return it so the user can see they have one set
        profileDto.setBinanceApiSecret(user.getBinanceApiSecret()); 

        return ResponseEntity.ok(profileDto);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody UserProfileDto profileDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        user.setName(profileDto.getName());
        // Email is usually not updatable or requires verification
        // user.setEmail(profileDto.getEmail()); 
        
        if (profileDto.getBinanceApiKey() != null) {
            user.setBinanceApiKey(profileDto.getBinanceApiKey());
        }
        if (profileDto.getBinanceApiSecret() != null) {
            user.setBinanceApiSecret(profileDto.getBinanceApiSecret());
        }

        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully!");
    }
}
