package com.portfolio.backend.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class RiskService {

    public Map<String, Object> analyzeContract(String address) {
        Map<String, Object> result = new HashMap<>();
        
        // Simulation/Mock Logic
        if (address.toLowerCase().startsWith("0x0000") || address.toLowerCase().contains("dead")) {
            result.put("riskScore", 95);
            result.put("riskLevel", "HIGH");
            result.put("verdict", "Phishing / Burn Address");
            result.put("details", Arrays.asList(
                "Address flagged in multiple scam databases",
                "High volume of washed transactions",
                "Verified malicious contract code"
            ));
        } else if (address.toLowerCase().endsWith("bad")) {
            result.put("riskScore", 75);
            result.put("riskLevel", "MEDIUM");
            result.put("verdict", "Suspicious Activity");
            result.put("details", Arrays.asList(
                "Contract ownership not renounced",
                "Liquidity not locked",
                "New contract deployed < 24h ago"
            ));
        } else {
            result.put("riskScore", 15);
            result.put("riskLevel", "LOW");
            result.put("verdict", "Safe");
            result.put("details", Arrays.asList(
                "Audited contract code",
                "Liquidity locked for 1 year",
                "No malicious functions detected"
            ));
        }
        
        return result;
    }
}
