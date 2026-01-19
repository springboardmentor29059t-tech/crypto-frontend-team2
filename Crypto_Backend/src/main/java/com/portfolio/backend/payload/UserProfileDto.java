package com.portfolio.backend.payload;

import lombok.Data;

@Data
public class UserProfileDto {
    private String name;
    private String email;
    private String binanceApiKey;
    private String binanceApiSecret;
}
