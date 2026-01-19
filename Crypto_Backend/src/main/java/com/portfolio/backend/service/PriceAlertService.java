package com.portfolio.backend.service;

import com.portfolio.backend.entity.PriceAlert;
import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.PriceAlertRepository;
import com.portfolio.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PriceAlertService {

    @Autowired
    private PriceAlertRepository priceAlertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PriceService priceService;

    @Autowired
    private NotificationService notificationService;

    public PriceAlert createAlert(Long userId, String symbol, Double targetPrice, String condition) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        PriceAlert alert = new PriceAlert(user, symbol.toUpperCase(), targetPrice, condition.toUpperCase());
        return priceAlertRepository.save(alert);
    }

    public List<PriceAlert> getUserAlerts(Long userId) {
        return priceAlertRepository.findByUserId(userId);
    }

    public void deleteAlert(Long id, Long userId) {
        PriceAlert alert = priceAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        if (!alert.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        priceAlertRepository.delete(alert);
    }

    // Check alerts every 60 seconds
    @Scheduled(fixedRate = 60000)
    public void checkAlerts() {
        List<PriceAlert> activeAlerts = priceAlertRepository.findByIsActiveTrue();
        if (activeAlerts.isEmpty()) return;

        Map<String, Double> currentPrices = priceService.getPrices(null);
        
        for (PriceAlert alert : activeAlerts) {
            Double currentPrice = currentPrices.get(alert.getSymbol());
            if (currentPrice == null) continue; // Price not found (maybe minor coin)

            boolean triggered = false;
            
            if ("ABOVE".equals(alert.getCondition())) {
                if (currentPrice >= alert.getTargetPrice()) {
                    triggered = true;
                }
            } else if ("BELOW".equals(alert.getCondition())) {
                if (currentPrice <= alert.getTargetPrice()) {
                    triggered = true;
                }
            }

            if (triggered) {
                // Trigger Notification
                String msg = alert.getSymbol() + " has reached " + currentPrice + " (Target: " + alert.getCondition() + " " + alert.getTargetPrice() + ")";
                notificationService.createNotification(alert.getUser().getId(), "ALERT", msg);

                // Deactivate Alert to prevent spam
                alert.setActive(false);
                priceAlertRepository.save(alert);
                
                System.out.println("Alert Triggered: " + msg);
            }
        }
    }
}
