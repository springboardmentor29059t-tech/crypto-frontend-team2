package com.portfolio.backend.controller;

import com.portfolio.backend.service.PriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    @Autowired
    private PriceService priceService;

    @GetMapping("/top")
    public ResponseEntity<?> getTopCoins() {
        return ResponseEntity.ok(priceService.getTopCoins());
    }

    @GetMapping("/chart/{id}")
    public ResponseEntity<?> getMarketChart(@PathVariable String id, @RequestParam(required = false, defaultValue = "7") String days) {
        return ResponseEntity.ok(priceService.getMarketChart(id, days));
    }

    @GetMapping("/ohlc/{id}")
    public ResponseEntity<?> getMarketOhlc(@PathVariable String id, @RequestParam(required = false, defaultValue = "7") String days) {
        return ResponseEntity.ok(priceService.getMarketOhlc(id, days));
    }
}
