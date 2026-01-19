package com.portfolio.backend.controller;

import com.portfolio.backend.entity.ApiKey;
import com.portfolio.backend.entity.Exchange;
import com.portfolio.backend.service.ExchangeService;
import com.portfolio.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exchanges")
public class ExchangeController {

    @Autowired
    private ExchangeService exchangeService;
    
    @Autowired
    private com.portfolio.backend.service.PriceService priceService;

    @GetMapping
    public List<Exchange> getAllExchanges() {
        return exchangeService.getAllExchanges();
    }
    
    @GetMapping("/prices")
    public Map<String, Double> getLivePrices() {
        return priceService.getPrices(null);
    }

    @GetMapping("/keys")
    public List<ApiKey> getUserKeys(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return exchangeService.getUserApiKeys(userDetails.getId());
    }

    @PostMapping("/keys")
    public ResponseEntity<?> addApiKey(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                       @RequestBody Map<String, String> request) {
        try {
            String exchangeName = request.get("exchangeName");
            String apiKey = request.get("apiKey");
            String apiSecret = request.get("apiSecret");
            String label = request.get("label");

            ApiKey createdKey = exchangeService.addApiKey(userDetails.getId(), exchangeName, apiKey, apiSecret, label);
            return ResponseEntity.ok(createdKey);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{exchangeName}/balances")
    public ResponseEntity<?> getBalances(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @PathVariable String exchangeName) {
        try {
            java.util.Map<String, Double> balances = exchangeService.getBalances(userDetails.getId(), exchangeName);
            return ResponseEntity.ok(balances);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @DeleteMapping("/keys/{id}")
    public ResponseEntity<?> deleteApiKey(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                          @PathVariable Long id) {
        try {
            exchangeService.deleteApiKey(userDetails.getId(), id);
            return ResponseEntity.ok("API Key deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/{exchangeName}/trades")
    public List<Map<String, Object>> getTrades(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                               @PathVariable String exchangeName) {
        return exchangeService.getTrades(exchangeName, userDetails.getId());
    }

    @GetMapping("/candles")
    public ResponseEntity<?> getCandles(@RequestParam String symbol, 
                                        @RequestParam(defaultValue = "1d") String interval) {
        // Exchange name could be param, default to Binance for now
        return ResponseEntity.ok(exchangeService.getCandles("Binance", symbol, interval));
    }
}
