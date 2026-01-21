package com.portfolio.backend.service;

import com.portfolio.backend.entity.ApiKey;
import com.portfolio.backend.entity.Exchange;
import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.ApiKeyRepository;
import com.portfolio.backend.repository.ExchangeRepository;
import com.portfolio.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class ExchangeService {

    @Autowired
    private ExchangeRepository exchangeRepository;

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private BinanceService binanceService;

    @Autowired
    private NotificationService notificationService;

    public List<Exchange> getAllExchanges() {
        return exchangeRepository.findAll();
    }

    public List<ApiKey> getUserApiKeys(Long userId) {
        List<ApiKey> keys = new ArrayList<>(apiKeyRepository.findByUserId(userId));
        
        // Include Key from User Profile if exists (Legacy/Simple Mode)
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getBinanceApiKey() != null && !user.getBinanceApiKey().isEmpty()) {
                // Check if already in keys list to avoid duplicate
                boolean exists = keys.stream().anyMatch(k -> "Binance".equalsIgnoreCase(k.getExchange().getName()));
                if (!exists) {
                    ApiKey simpleKey = new ApiKey();
                    simpleKey.setId(-1L); // Transient ID
                    simpleKey.setUser(user);
                    simpleKey.setApiKey(user.getBinanceApiKey());
                    if (user.getBinanceApiSecret() != null) {
                        try {
                             // Temporarily encrypt or just store raw? 
                             // Since we use it internally, let's store raw but mark it so we know not to decrypt?
                             // actually getBalances decrypts it. So we should encrypt it here so getBalances works, 
                             // OR modify getBalances. Modifying getBalances is properly robust.
                             // Let's store raw here and handle it in getBalances
                             simpleKey.setApiSecret(user.getBinanceApiSecret());
                        } catch (Exception e) {}
                    }
                    Exchange binance = exchangeRepository.findByName("Binance").orElse(new Exchange());
                    if (binance.getName() == null) binance.setName("Binance");
                    simpleKey.setExchange(binance);
                    simpleKey.setLabel("Main Account");
                    keys.add(simpleKey);
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching user profile keys: " + e.getMessage());
        }
        
        return keys;
    }

    public java.util.Map<String, Double> getBalances(Long userId, String exchangeName) throws Exception {
        // 1. Try Simple Profile Key first for Binance
        if ("Binance".equalsIgnoreCase(exchangeName)) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getBinanceApiKey() != null && !user.getBinanceApiKey().isEmpty()) {
                 return binanceService.getAccountBalances(user.getBinanceApiKey(), user.getBinanceApiSecret());
            }
        }

        // 2. Fallback to flexible ApiKey system
        Exchange exchange = exchangeRepository.findByName(exchangeName)
                .orElseThrow(() -> new RuntimeException("Exchange not found"));

        ApiKey apiKeyEntity = apiKeyRepository.findByUserIdAndExchangeId(userId, exchange.getId())
                .orElseThrow(() -> new RuntimeException("API Key not found for this exchange"));

        String decryptedSecret = encryptionService.decrypt(apiKeyEntity.getApiSecret());

        if ("Binance".equalsIgnoreCase(exchangeName)) {
            return binanceService.getAccountBalances(apiKeyEntity.getApiKey().trim(), decryptedSecret.trim());
        }

        throw new RuntimeException("Exchange integration not implemented: " + exchangeName);
    }

    @Transactional
    public ApiKey addApiKey(Long userId, String exchangeName, String apiKey, String apiSecret, String label) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Exchange exchange = exchangeRepository.findByName(exchangeName)
                .orElseThrow(() -> new RuntimeException("Exchange not found"));

        // Check if key already exists for this exchange
        if (apiKeyRepository.findByUserIdAndExchangeId(userId, exchange.getId()).isPresent()) {
             throw new RuntimeException("API Key for this exchange already exists");
        }

        String encryptedSecret = encryptionService.encrypt(apiSecret.trim());
        
        ApiKey newKey = new ApiKey();
        newKey.setUser(user);
        newKey.setExchange(exchange);
        newKey.setApiKey(apiKey.trim());
        newKey.setApiSecret(encryptedSecret);
        newKey.setLabel(label);

        ApiKey savedKey = apiKeyRepository.save(newKey);
        
        try {
            notificationService.createNotification(userId, "SUCCESS", "Connected to " + exchangeName + " successfully!");
        } catch (Exception e) {}
        
        return savedKey;
    }

    @Transactional
    public void deleteApiKey(Long userId, Long keyId) {
        ApiKey apiKey = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new RuntimeException("API Key not found"));

        if (!apiKey.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this key");
        }

        apiKeyRepository.delete(apiKey);
        
        try {
            notificationService.createNotification(userId, "WARNING", "Disconnected from " + apiKey.getExchange().getName());
        } catch (Exception e) {}
    }
    
    public List<Map<String, Object>> getTrades(String exchangeName, Long userId) {
        if (!"Binance".equalsIgnoreCase(exchangeName)) {
            return new ArrayList<>();
        }

        String apiKey = null;
        String apiSecret = null;

        // 1. Try Profile Key
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getBinanceApiKey() != null && !user.getBinanceApiKey().isEmpty()) {
            apiKey = user.getBinanceApiKey();
            apiSecret = user.getBinanceApiSecret();
        } 
        // 2. Try stored ApiKey entity
        else {
             try {
                List<ApiKey> keys = apiKeyRepository.findByUserId(userId);
                ApiKey binanceKey = keys.stream()
                    .filter(k -> k.getExchange().getName().equalsIgnoreCase("Binance"))
                    .findFirst()
                    .orElse(null);
                
                if (binanceKey != null) {
                    apiKey = binanceKey.getApiKey();
                    apiSecret = encryptionService.decrypt(binanceKey.getApiSecret());
                }
             } catch (Exception e) {}
        }

        if (apiKey == null) {
            return new ArrayList<>();
        }

        try {
            String[] majorPairs = {"BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"};
            
            List<CompletableFuture<List<Map<String, Object>>>> futures = new ArrayList<>();
            for (String symbol : majorPairs) {
                String finalApiKey = apiKey;
                String finalApiSecret = apiSecret;
                futures.add(CompletableFuture.supplyAsync(() -> {
                    try {
                        return binanceService.getMyTrades(symbol, finalApiKey.trim(), finalApiSecret.trim());
                    } catch (Exception e) {
                        System.err.println("Failed to fetch trades for " + symbol + ": " + e.getMessage());
                        return new ArrayList<>();
                    }
                }));
            }

            List<Map<String, Object>> allTrades = futures.stream()
                .map(CompletableFuture::join)
                .flatMap(List::stream)
                .collect(java.util.stream.Collectors.toList());

            // Sort
            allTrades.sort((t1, t2) -> Long.compare((Long)t2.get("time"), (Long)t1.get("time")));
            
            return allTrades;
        } catch (Exception e) {
            System.err.println("Failed to fetch trades: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    public List<Map<String, Object>> getCandles(String exchangeName, String symbol, String interval) {
        if ("Binance".equalsIgnoreCase(exchangeName)) {
             // For simplify, we assume USDT pair if not specified? 
             // Or the frontend passes full pair (e.g. BTCUSDT)
             // Frontend sends symbol "BTC", we append "USDT" for Binance default
             String pair = symbol.toUpperCase().endsWith("USDT") ? symbol : symbol + "USDT";
             return binanceService.getCandlesData(pair, interval);
        }
        return new ArrayList<>();
    }
}
