package com.portfolio.backend.controller;

import com.portfolio.backend.entity.PriceAlert;
import com.portfolio.backend.security.UserDetailsImpl;
import com.portfolio.backend.service.PriceAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class PriceAlertController {

    @Autowired
    private PriceAlertService priceAlertService;

    @GetMapping
    public List<PriceAlert> getUserAlerts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return priceAlertService.getUserAlerts(userDetails.getId());
    }

    @PostMapping
    public ResponseEntity<?> createAlert(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @RequestBody Map<String, Object> payload) {
        try {
            Long userId = userDetails.getId();
            String symbol = (String) payload.get("symbol");
            Double targetPrice = Double.valueOf(payload.get("targetPrice").toString());
            String condition = (String) payload.get("condition"); // ABOVE or BELOW

            PriceAlert alert = priceAlertService.createAlert(userId, symbol, targetPrice, condition);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create alert: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlert(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @PathVariable Long id) {
        try {
            priceAlertService.deleteAlert(id, userDetails.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete alert: " + e.getMessage());
        }
    }
}
