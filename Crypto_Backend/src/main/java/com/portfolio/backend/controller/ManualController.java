package com.portfolio.backend.controller;

import com.portfolio.backend.entity.ManualTransaction;
import com.portfolio.backend.security.JwtUtils;
import com.portfolio.backend.service.ManualService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/manual")
public class ManualController {

    @Autowired
    private ManualService manualService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping
    public ResponseEntity<?> addTransaction(@AuthenticationPrincipal com.portfolio.backend.security.UserDetailsImpl userDetails, 
                                          @jakarta.validation.Valid @RequestBody com.portfolio.backend.dto.ManualTransactionDTO payload) {
        try {
            Long userId = userDetails.getId();
            
            ManualTransaction tx = manualService.addTransaction(
                userId, 
                payload.getSymbol(), 
                payload.getAmount(), 
                payload.getPrice(), 
                payload.getType()
            );
            
            // Return created DTO (id is generated)
            payload.setId(tx.getId());
            payload.setDate(tx.getDate());
            
            return ResponseEntity.ok(payload);
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.badRequest().body("Error processing transaction: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<com.portfolio.backend.dto.ManualTransactionDTO>> getTransactions(@AuthenticationPrincipal com.portfolio.backend.security.UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();
        List<ManualTransaction> transactions = manualService.getUserTransactions(userId);
        List<com.portfolio.backend.dto.ManualTransactionDTO> dtos = transactions.stream()
            .map(tx -> new com.portfolio.backend.dto.ManualTransactionDTO(
                tx.getId(),
                tx.getSymbol(),
                tx.getAmount(),
                tx.getPrice(),
                tx.getDate(),
                tx.getType().name()
            ))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@AuthenticationPrincipal com.portfolio.backend.security.UserDetailsImpl userDetails, @PathVariable Long id) {
        Long userId = userDetails.getId();
        manualService.deleteTransaction(id, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@AuthenticationPrincipal com.portfolio.backend.security.UserDetailsImpl userDetails, 
                                             @PathVariable Long id,
                                             @RequestBody Map<String, Object> payload) {
        try {
            Long userId = userDetails.getId();
            
            String symbol = payload.get("symbol") != null ? payload.get("symbol").toString().toUpperCase().trim() : null;
            
            BigDecimal amount = null;
            if (payload.get("amount") != null) {
                amount = new BigDecimal(payload.get("amount").toString());
            }

            BigDecimal price = null;
            if (payload.get("price") != null) {
                price = new BigDecimal(payload.get("price").toString());
            }

            String type = (String) payload.get("type");
            
            LocalDateTime date = null;
            if (payload.get("date") != null) {
                // Expect ISO format or simple format? Frontend likely sends ISO or similar.
                // Let's assume generic ISO for now: 2011-12-03T10:15:30
                try {
                     date = LocalDateTime.parse(payload.get("date").toString());
                } catch (Exception e) {
                     // Try fallback format if needed
                }
            }

            ManualTransaction tx = manualService.updateTransaction(id, userId, symbol, amount, price, type, date);
            
            com.portfolio.backend.dto.ManualTransactionDTO dto = new com.portfolio.backend.dto.ManualTransactionDTO(
                tx.getId(),
                tx.getSymbol(),
                tx.getAmount(),
                tx.getPrice(),
                tx.getDate(),
                tx.getType().name()
            );

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating transaction: " + e.getMessage());
        }
    }
}
