package com.portfolio.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_snapshots")
public class PortfolioSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "total_value_usd", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalValueUsd;

    @Column(name = "asset_count")
    private Integer assetCount;

    // Constructors
    public PortfolioSnapshot() {}

    public PortfolioSnapshot(Long userId, LocalDateTime timestamp, BigDecimal totalValueUsd, Integer assetCount) {
        this.userId = userId;
        this.timestamp = timestamp;
        this.totalValueUsd = totalValueUsd;
        this.assetCount = assetCount;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public BigDecimal getTotalValueUsd() {
        return totalValueUsd;
    }

    public void setTotalValueUsd(BigDecimal totalValueUsd) {
        this.totalValueUsd = totalValueUsd;
    }

    public Integer getAssetCount() {
        return assetCount;
    }

    public void setAssetCount(Integer assetCount) {
        this.assetCount = assetCount;
    }
}
