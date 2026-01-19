package com.portfolio.backend.controller;

import com.portfolio.backend.entity.PortfolioSnapshot;
import com.portfolio.backend.security.UserDetailsImpl;
import com.portfolio.backend.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @GetMapping("/summary")
    public ResponseEntity<?> getPortfolioSummary(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long userId = userDetails.getId();
            System.out.println("PortfolioController: Request for summary received for user " + userId);
            List<Map<String, Object>> summary = portfolioService.getPortfolioSummary(userId);
            System.out.println("PortfolioController: Returning summary with " + summary.size() + " assets");
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch portfolio summary: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<PortfolioSnapshot>> getPortfolioHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();
        return ResponseEntity.ok(portfolioService.getHistory(userId));
    }

    @GetMapping("/performance")
    public ResponseEntity<?> getPortfolioPerformance(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long userId = userDetails.getId();
            Map<String, Object> performance = portfolioService.getPortfolioPerformance(userId);
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch performance: " + e.getMessage());
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long userId = userDetails.getId();
            List<Map<String, Object>> txs = portfolioService.getTransactions(userId);
            return ResponseEntity.ok(txs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch transactions: " + e.getMessage());
        }
    }
}
