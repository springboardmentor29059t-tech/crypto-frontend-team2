package com.portfolio.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_alerts")
public class PriceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(nullable = false)
    private String symbol; // e.g. BTC

    @Column(nullable = false)
    private Double targetPrice;

    @Column(nullable = false)
    private String condition; // ABOVE, BELOW

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    public PriceAlert() {}

    public PriceAlert(User user, String symbol, Double targetPrice, String condition) {
        this.user = user;
        this.symbol = symbol;
        this.targetPrice = targetPrice;
        this.condition = condition;
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public Double getTargetPrice() { return targetPrice; }
    public void setTargetPrice(Double targetPrice) { this.targetPrice = targetPrice; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
