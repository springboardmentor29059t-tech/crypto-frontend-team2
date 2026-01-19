package com.portfolio.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class BinanceService {

    private static final String BINANCE_API_URL = "https://api.binance.com";
    private static final String HMAC_SHA256 = "HmacSHA256";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Double> getAccountBalances(String apiKey, String apiSecret) throws Exception {
        String endpoint = "/api/v3/account";
        
        // Demo Mode for testing UI
        if ("111".equals(apiKey) || "test".equals(apiKey)) {
            Map<String, Double> mockBalances = new HashMap<>();
            mockBalances.put("BTC", 0.45);
            mockBalances.put("ETH", 12.5);
            mockBalances.put("USDT", 25000.00);
            mockBalances.put("BNB", 150.0);
            return mockBalances;
        }

        long timestamp = System.currentTimeMillis();
        String queryString = "timestamp=" + timestamp;
        
        String signature = sign(queryString, apiSecret);
        String finalUrl = BINANCE_API_URL + endpoint + "?" + queryString + "&signature=" + signature;

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-MBX-APIKEY", apiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(finalUrl, HttpMethod.GET, entity, String.class);
        
        return parseBalances(response.getBody());
    }

    private String sign(String message, String secret) throws Exception {
        Mac sha256_HMAC = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        sha256_HMAC.init(secret_key);
        byte[] bytes = sha256_HMAC.doFinal(message.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(bytes);
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    private Map<String, Double> parseBalances(String jsonResponse) throws Exception {
        Map<String, Double> balances = new HashMap<>();
        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode balancesNode = root.get("balances");

        if (balancesNode.isArray()) {
            for (JsonNode node : balancesNode) {
                String asset = node.get("asset").asText();
                double free = node.get("free").asDouble();
                double locked = node.get("locked").asDouble();
                if (free > 0 || locked > 0) {
                    balances.put(asset, free + locked);
                }
            }
        }
        return balances;
    }
    public java.util.List<Map<String, Object>> getMyTrades(String symbol, String apiKey, String apiSecret) throws Exception {
        String endpoint = "/api/v3/myTrades";
        long timestamp = System.currentTimeMillis();
        String queryString = "symbol=" + symbol + "&timestamp=" + timestamp;
        
        // Demo Mode for testing UI
        if ("111".equals(apiKey) || "test".equals(apiKey)) {
            java.util.List<Map<String, Object>> mockTrades = new java.util.ArrayList<>();
            
            // Add some mock trades for BTCUSDT if requested
            if (symbol.equals("BTCUSDT")) {
                Map<String, Object> trade1 = new HashMap<>();
                trade1.put("id", 1001L);
                trade1.put("symbol", "BTCUSDT");
                trade1.put("price", 60000.0);
                trade1.put("qty", 0.1);
                trade1.put("quoteQty", 6000.0);
                trade1.put("time", System.currentTimeMillis() - 86400000L * 7); // 7 days ago
                trade1.put("isBuyer", true);
                mockTrades.add(trade1);

                Map<String, Object> trade2 = new HashMap<>();
                trade2.put("id", 1002L);
                trade2.put("symbol", "BTCUSDT");
                trade2.put("price", 65000.0);
                trade2.put("qty", 0.2);
                trade2.put("quoteQty", 13000.0);
                trade2.put("time", System.currentTimeMillis() - 86400000L * 3); // 3 days ago
                trade2.put("isBuyer", true);
                mockTrades.add(trade2);
            }
            
            // Add mock trades for ETHUSDT
            if (symbol.equals("ETHUSDT")) {
                Map<String, Object> trade1 = new HashMap<>();
                trade1.put("id", 2001L);
                trade1.put("symbol", "ETHUSDT");
                trade1.put("price", 2500.0);
                trade1.put("qty", 5.0);
                trade1.put("quoteQty", 12500.0);
                trade1.put("time", System.currentTimeMillis() - 86400000L * 10);
                trade1.put("isBuyer", true);
                mockTrades.add(trade1);
            }
            
            return mockTrades;
        }

        String signature = sign(queryString, apiSecret);
        String finalUrl = BINANCE_API_URL + endpoint + "?" + queryString + "&signature=" + signature;

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-MBX-APIKEY", apiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(finalUrl, HttpMethod.GET, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            
            java.util.List<Map<String, Object>> trades = new java.util.ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    Map<String, Object> trade = new HashMap<>();
                    trade.put("id", node.get("id").asLong());
                    trade.put("symbol", node.get("symbol").asText());
                    trade.put("price", node.get("price").asDouble());
                    trade.put("qty", node.get("qty").asDouble());
                    trade.put("quoteQty", node.get("quoteQty").asDouble());
                    trade.put("time", node.get("time").asLong());
                    trade.put("isBuyer", node.get("isBuyer").asBoolean());
                    trades.add(trade);
                }
            }
            return trades;
        } catch (Exception e) {
            // If symbol doesn't exist or other error, return empty list rather than crashing
            System.err.println("Failed to fetch trades for " + symbol + ": " + e.getMessage());
            return new java.util.ArrayList<>(); 
        }
    }


    public java.util.List<Map<String, Object>> getCandlesData(String symbol, String interval) {
        // Interval: 1h, 4h, 1d, etc. Default to 1d if null
        String validInterval = (interval != null && !interval.isEmpty()) ? interval : "1d";
        
        String endpoint = "/api/v3/klines";
        // Limit to 100 for simplicity
        String queryString = "symbol=" + symbol + "&interval=" + validInterval + "&limit=100";
        String finalUrl = BINANCE_API_URL + endpoint + "?" + queryString;
        // Public endpoint, no signature needed

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(finalUrl, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            
            java.util.List<Map<String, Object>> candles = new java.util.ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    Map<String, Object> candle = new HashMap<>();
                    // [0] = Open time
                    // [1] = Open
                    // [2] = High
                    // [3] = Low
                    // [4] = Close
                    // [5] = Volume
                    candle.put("time", node.get(0).asLong());
                    candle.put("open", node.get(1).asDouble());
                    candle.put("high", node.get(2).asDouble());
                    candle.put("low", node.get(3).asDouble());
                    candle.put("close", node.get(4).asDouble());
                    candle.put("volume", node.get(5).asDouble());
                    candles.add(candle);
                }
            }
            return candles;
        } catch (Exception e) {
            System.err.println("Failed to fetch candles for " + symbol + ": " + e.getMessage());
            return new java.util.ArrayList<>();
        }
    }
}
