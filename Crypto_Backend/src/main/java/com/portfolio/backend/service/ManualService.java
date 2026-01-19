package com.portfolio.backend.service;

import com.portfolio.backend.entity.ManualTransaction;
import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.ManualTransactionRepository;
import com.portfolio.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ManualService {

    @Autowired
    private ManualTransactionRepository manualTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public ManualTransaction addTransaction(Long userId, String symbol, BigDecimal amount, BigDecimal price, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ManualTransaction tx = new ManualTransaction();
        tx.setUser(user);
        tx.setSymbol(symbol.toUpperCase());
        tx.setAmount(amount);
        tx.setPrice(price);
        tx.setDate(LocalDateTime.now());
        tx.setType(ManualTransaction.TransactionType.valueOf(type.toUpperCase()));

        ManualTransaction savedTx = manualTransactionRepository.save(tx);

        try {
            notificationService.createNotification(userId, "INFO", "Added " + type.toUpperCase() + " transaction: " + symbol.toUpperCase());
        } catch (Exception e) {
             System.err.println("Failed to send notification: " + e.getMessage());
        }
        
        return savedTx;
    }

    public List<ManualTransaction> getUserTransactions(Long userId) {
        return manualTransactionRepository.findByUserId(userId);
    }

    public void deleteTransaction(Long id, Long userId) {
        ManualTransaction tx = manualTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (!tx.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        manualTransactionRepository.delete(tx);

        try {
            notificationService.createNotification(userId, "WARNING", "Deleted transaction for " + tx.getSymbol());
        } catch (Exception e) {
             System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    public ManualTransaction updateTransaction(Long id, Long userId, String symbol, BigDecimal amount, BigDecimal price, String type, LocalDateTime date) {
        ManualTransaction tx = manualTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!tx.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (symbol != null) tx.setSymbol(symbol.toUpperCase());
        if (amount != null) tx.setAmount(amount);
        if (price != null) tx.setPrice(price);
        if (type != null) tx.setType(ManualTransaction.TransactionType.valueOf(type.toUpperCase()));
        if (date != null) tx.setDate(date);
        
        // Optional: Update date? Usually specific edits might want to keep original date or update it. 
        // For now, let's keep the original date to preserve history accuracy, or we could allow editing date too.
        // The prompt asked for "add/edit functionality", typically includes modifying details.

        ManualTransaction savedTx = manualTransactionRepository.save(tx);
        
        try {
            notificationService.createNotification(userId, "INFO", "Updated transaction for " + savedTx.getSymbol());
        } catch (Exception e) {
             System.err.println("Failed to send notification: " + e.getMessage());
        }
        
        return savedTx;
    }
}
