package com.portfolio.backend.repository;

import com.portfolio.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByDateDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
}
