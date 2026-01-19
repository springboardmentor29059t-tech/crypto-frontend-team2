package com.portfolio.backend.controller;

import com.portfolio.backend.service.RiskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/risk")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RiskController {

    @Autowired
    private RiskService riskService;

    @GetMapping("/analyze")
    public ResponseEntity<?> analyzeContract(@RequestParam String address) {
        try {
            if (address == null || address.length() < 10) {
                 return ResponseEntity.badRequest().body(Map.of("message", "Invalid contract address"));
            }
            Map<String, Object> result = riskService.analyzeContract(address);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error analyzing contract"));
        }
    }
}
