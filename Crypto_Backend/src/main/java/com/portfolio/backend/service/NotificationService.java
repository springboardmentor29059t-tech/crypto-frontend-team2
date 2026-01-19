package com.portfolio.backend.service;

import com.portfolio.backend.entity.Notification;
import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.NotificationRepository;
import com.portfolio.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByDateDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public Notification markAsRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!n.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        n.setRead(true);
        return notificationRepository.save(n);
    }
    
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByDateDesc(userId);
        for(Notification n : list) {
             if(!n.isRead()) {
                 n.setRead(true);
                 notificationRepository.save(n);
             }
        }
    }

    public Notification createNotification(Long userId, String type, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification n = new Notification(user, type, message, LocalDateTime.now());
        return notificationRepository.save(n);
    }
}
