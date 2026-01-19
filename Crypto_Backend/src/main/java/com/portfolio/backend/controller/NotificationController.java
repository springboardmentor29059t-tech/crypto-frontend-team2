package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Notification;
import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.UserRepository;
import com.portfolio.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;
    
    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user.getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        User user = getAuthenticatedUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }
    
    // For testing/demo purposes, endpoint to trigger a notification
    @PostMapping("/test")
    public ResponseEntity<?> createTestNotification(@RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser();
        notificationService.createNotification(user.getId(), payload.get("type"), payload.get("message"));
        return ResponseEntity.ok().build();
    }
}
