package com.portfolio.backend.controller;

import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.UserRepository;
import com.portfolio.backend.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv() {
        try {
            // Get Current User
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetails userDetails = (UserDetails) authentication.getPrincipal(); // Should verify type
            String email = userDetails.getUsername();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            // Fetch Transactions
            List<Map<String, Object>> transactions = portfolioService.getTransactions(user.getId());

            // Generate CSV
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            try (PrintWriter writer = new PrintWriter(out)) {
                // Header
                writer.println("Date,Type,Asset,Amount,Price,Value,Status");

                // Rows
                for (Map<String, Object> tx : transactions) {
                    writer.printf("%s,%s,%s,%s,%s,%s,%s%n",
                            tx.get("date"),
                            tx.get("type"),
                            tx.get("asset"),
                            tx.get("amount"),
                            tx.get("price"),
                            tx.get("value"),
                            tx.get("status")
                    );
                }
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(out.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
