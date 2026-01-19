package com.portfolio.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ManualTransactionDTO {
    private Long id;

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.00000001", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;

    private LocalDateTime date;

    @NotBlank(message = "Type is required")
    @Pattern(regexp = "BUY|SELL|DEPOSIT|WITHDRAW", message = "Type must be BUY, SELL, DEPOSIT, or WITHDRAW")
    private String type;

    public ManualTransactionDTO() {}

    public ManualTransactionDTO(Long id, String symbol, BigDecimal amount, BigDecimal price, LocalDateTime date, String type) {
        this.id = id;
        this.symbol = symbol;
        this.amount = amount;
        this.price = price;
        this.date = date;
        this.type = type;
    }

    // Getters
    public Long getId() { return id; }
    public String getSymbol() { return symbol; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getPrice() { return price; }
    public LocalDateTime getDate() { return date; }
    public String getType() { return type; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public void setType(String type) { this.type = type; }
}
