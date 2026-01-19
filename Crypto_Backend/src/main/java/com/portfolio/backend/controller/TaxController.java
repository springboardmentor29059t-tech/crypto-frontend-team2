package com.portfolio.backend.controller;

import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.UserRepository;
import com.portfolio.backend.service.ManualService;
import com.portfolio.backend.service.TaxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tax")
public class TaxController {

    @Autowired
    private TaxService taxService;

    @Autowired
    private ManualService manualService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/report")
    public ResponseEntity<?> getTaxReport(@RequestParam(defaultValue = "2025") int year) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            var transactions = manualService.getUserTransactions(user.getId());
            Map<String, Object> report = taxService.calculateRealizedPnl(transactions, year);

            return ResponseEntity.ok(report);
        } catch (Exception e) {
            e.printStackTrace(); // Minimal logging for now
            return ResponseEntity.internalServerError().body("Error calculating tax: " + e.getMessage());
        }
    }
}
