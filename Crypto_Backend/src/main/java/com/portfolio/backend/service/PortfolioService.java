package com.portfolio.backend.service;

import com.portfolio.backend.entity.PortfolioSnapshot;
import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.PortfolioSnapshotRepository;
import com.portfolio.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PortfolioSnapshotRepository portfolioSnapshotRepository;

    @Autowired
    private ExchangeService exchangeService;

    @Autowired
    private ManualService manualService;

    @Autowired
    private PriceService priceService;

    // Run every 60 seconds to capture portfolio value
    @Scheduled(fixedRate = 60000) 
    public void snapshotPortfolios() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
             try {
                 calculateAndSaveSnapshot(user);
             } catch (Exception e) {
                 System.err.println("Failed to snapshot portfolio for user " + user.getId() + ": " + e.getMessage());
             }
        }
    }

    private void calculateAndSaveSnapshot(User user) throws Exception {
        Long userId = user.getId();
        double totalValueUsd = 0.0;
        int assetCount = 0;

        // Reuse the logic from getPortfolioSummary but simplified for just total value
        List<Map<String, Object>> assets = getPortfolioSummary(userId);
        
        for (Map<String, Object> asset : assets) {
            double value = (double) asset.get("value");
            if (value > 0) {
                totalValueUsd += value;
                assetCount++;
            }
        }

        if (totalValueUsd > 0) {
            PortfolioSnapshot snapshot = new PortfolioSnapshot();
            snapshot.setUserId(userId);
            snapshot.setTimestamp(LocalDateTime.now());
            snapshot.setTotalValueUsd(BigDecimal.valueOf(totalValueUsd));
            snapshot.setAssetCount(assetCount);
            
            portfolioSnapshotRepository.save(snapshot);
            System.out.println("Saved snapshot for user " + userId + ": $" + totalValueUsd);
        }
    }
    
    public List<PortfolioSnapshot> getHistory(Long userId) {
        return portfolioSnapshotRepository.findByUserIdOrderByTimestampAsc(userId);
    }
    
    // Core Logic: Cost Basis & PnL
    public List<Map<String, Object>> getTransactions(Long userId) {
        List<UnifiedTransaction> allTxs = getAllUnifiedTransactions(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Sort descending for display (newest first)
        allTxs.sort((t1, t2) -> Long.compare(t2.timestamp, t1.timestamp));

        for (UnifiedTransaction tx : allTxs) {
            Map<String, Object> item = new HashMap<>();
            
            // Construct ID for Frontend: "man-123" for manual, "12345" for exchange
            String displayId = "manual".equals(tx.source) ? "man-" + tx.originalId : tx.originalId;
            
            item.put("id", displayId);
            item.put("type", tx.type); 
            item.put("asset", tx.symbol);
            item.put("amount", tx.amount);
            item.put("price", tx.price);
            item.put("value", tx.amount * tx.price);
            item.put("date", new java.util.Date(tx.timestamp).toString());
            item.put("rawDate", tx.timestamp);
            item.put("status", "Completed");
            item.put("source", tx.source);
            result.add(item);
        }
        return result;
    }

    private List<UnifiedTransaction> getAllUnifiedTransactions(Long userId) {
        List<UnifiedTransaction> allTxs = new ArrayList<>();

        // A. Manual Transactions
        var manualTxs = manualService.getUserTransactions(userId);
        for (var tx : manualTxs) {
            long time = tx.getDate() != null ? java.sql.Timestamp.valueOf(tx.getDate()).getTime() : 0;
            allTxs.add(new UnifiedTransaction(
                tx.getSymbol().toUpperCase(),
                tx.getType().name(),
                tx.getAmount().doubleValue(),
                tx.getPrice() != null ? tx.getPrice().doubleValue() : 0.0,
                time,
                "manual",
                String.valueOf(tx.getId())
            ));
        }

        // B. Exchange Transactions
        var keys = exchangeService.getUserApiKeys(userId);
        for (var key : keys) {
            try {
                List<Map<String, Object>> trades = exchangeService.getTrades(key.getExchange().getName(), userId);
                for (Map<String, Object> trade : trades) {
                    String fullSymbol = (String) trade.get("symbol");
                    String symbol = fullSymbol.replace("USDT", "");
                    double price = ((Number) trade.get("price")).doubleValue();
                    double qty = ((Number) trade.get("qty")).doubleValue();
                    boolean isBuyer = (boolean) trade.get("isBuyer");
                    long time = ((Number) trade.get("time")).longValue();
                    String tradeId = String.valueOf(trade.get("id"));

                    allTxs.add(new UnifiedTransaction(
                        symbol,
                        isBuyer ? "BUY" : "SELL",
                        qty,
                        price,
                        time,
                        "exchange",
                        tradeId
                    ));
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch trades for user " + userId + ": " + e.getMessage());
            }
        }
        return allTxs;
    }

    public List<Map<String, Object>> getPortfolioSummary(Long userId) throws Exception {
        Map<String, AssetStats> statsMap = new HashMap<>();
        
        // 1. Fetch All Transactions (Manual + Exchange)
        List<UnifiedTransaction> allTxs = getAllUnifiedTransactions(userId);

        // 2. Sort Chronologically (Ascending for Cost Basis)
        allTxs.sort((t1, t2) -> Long.compare(t1.timestamp, t2.timestamp));

        // 3. Process Sorted Transactions for Cost Basis
        for (UnifiedTransaction tx : allTxs) {
            statsMap.putIfAbsent(tx.symbol, new AssetStats());
            AssetStats stats = statsMap.get(tx.symbol);

            if ("BUY".equalsIgnoreCase(tx.type) || "DEPOSIT".equalsIgnoreCase(tx.type)) {
                if ("BUY".equalsIgnoreCase(tx.type)) {
                    double currentVal = stats.currentBalance * stats.avgBuyPrice;
                    double newVal = tx.amount * tx.price;
                    double totalQty = stats.currentBalance + tx.amount;
                    
                    if (totalQty > 0) {
                        stats.avgBuyPrice = (currentVal + newVal) / totalQty;
                    }
                }
                stats.currentBalance += tx.amount;

            } else if ("SELL".equalsIgnoreCase(tx.type) || "WITHDRAW".equalsIgnoreCase(tx.type)) {
                // Calculate Realized PnL
                if (stats.avgBuyPrice > 0) {
                     double gain = (tx.price - stats.avgBuyPrice) * tx.amount;
                     stats.realizedPnL += gain;
                }
                
                stats.currentBalance -= tx.amount;
                if (stats.currentBalance < 0) stats.currentBalance = 0; 
            }
        }

        // 4. Reconcile with Real Balances
        var keys = exchangeService.getUserApiKeys(userId);
        Map<String, Double> prices = priceService.getPrices(null);
        Map<String, Double> realBalances = new HashMap<>();

        try {
            for (var key : keys) {
                try {
                    Map<String, Double> b = exchangeService.getBalances(userId, key.getExchange().getName());
                    b.forEach((k, v) -> realBalances.merge(k, v, Double::sum));
                } catch (Exception e) {}
            }
        } catch (Exception e) {}
        
        // Manual Balances
        var manualTxs = manualService.getUserTransactions(userId); // Fetch again or filter? Fetch again is safer/easier
        for (var tx : manualTxs) {
             String symbol = tx.getSymbol().toUpperCase();
             double amount = tx.getAmount().doubleValue();
             if ("BUY".equals(tx.getType().name()) || "DEPOSIT".equals(tx.getType().name())) {
                 realBalances.merge(symbol, amount, Double::sum);
             } else {
                 realBalances.merge(symbol, -amount, Double::sum);
             }
        }

        // 5. Final Result
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Map.Entry<String, Double> entry : realBalances.entrySet()) {
            String symbol = entry.getKey();
            double balance = entry.getValue();
            
            if (balance > 0.000001) {
                AssetStats stats = statsMap.getOrDefault(symbol, new AssetStats());
                double currentPrice = prices.getOrDefault(symbol, 0.0);
                if (currentPrice == 0.0 && "USDT".equals(symbol)) currentPrice = 1.0;
                
                double value = balance * currentPrice;
                double avgPrice = stats.avgBuyPrice; 
                
                double pnl = 0.0;
                double pnlPercent = 0.0;
                
                if (avgPrice > 0) {
                    pnl = (currentPrice - avgPrice) * balance;
                    pnlPercent = ((currentPrice - avgPrice) / avgPrice) * 100;
                }
                
                Map<String, Object> item = new HashMap<>();
                item.put("symbol", symbol);
                item.put("amount", balance);
                item.put("price", currentPrice);
                item.put("value", value);
                item.put("avgBuyPrice", avgPrice);
                item.put("pnl", pnl);
                item.put("pnlPercent", pnlPercent);
                
                result.add(item);
                
                // Add explicit Realized/Unrealized PnL
                item.put("realizedPnL", stats.realizedPnL);
                item.put("unrealizedPnL", pnl); // Existing PnL based on current balance is essentially unrealized
                // Total PnL = Realized + Unrealized
                item.put("totalPnL", stats.realizedPnL + pnl);
            }
        }
        
        return result;
    }

    private static class UnifiedTransaction {
        String symbol;
        String type;
        double amount;
        double price;
        long timestamp;
        String source;     // "manual" or "exchange"
        String originalId; // raw ID from DB or API

        public UnifiedTransaction(String symbol, String type, double amount, double price, long timestamp, String source, String originalId) {
            this.symbol = symbol;
            this.type = type;
            this.amount = amount;
            this.price = price;
            this.timestamp = timestamp;
            this.source = source;
            this.originalId = originalId;
        }
    }

    public Map<String, Object> getPortfolioPerformance(Long userId) {
        // 1. Calculate Current Total Value (Real-time)
        double currentTotal = 0.0;
        try {
             List<Map<String, Object>> assets = getPortfolioSummary(userId);
             currentTotal = assets.stream().mapToDouble(a -> (double)a.get("value")).sum();
        } catch (Exception e) {
             e.printStackTrace();
        }

        // 2. Get Snapshot ~24h Ago
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        PortfolioSnapshot pastSnapshot = portfolioSnapshotRepository.findTopByUserIdAndTimestampLessThanEqualOrderByTimestampDesc(userId, twentyFourHoursAgo);

        double pastTotal = (pastSnapshot != null) ? pastSnapshot.getTotalValueUsd().doubleValue() : 0.0;
        
        // 3. Calculate Deltas
        double changeValue = currentTotal - pastTotal;
        double changePercent = 0.0;
        if (pastTotal > 0) {
            changePercent = (changeValue / pastTotal) * 100;
        } else if (currentTotal > 0) {
             // If we have money now but 0 yesterday, technically infinite gain. 
             // But practically, maybe they just started. Let's show 0% or 100%? 
             // Let's show 0% to avoid confusion for new users unless appropriate.
             changePercent = 0.0; 
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalValue", currentTotal);
        response.put("changeValue", changeValue);
        response.put("changePercent", changePercent);
        
        return response;
    }

    // Helper Class
    private static class AssetStats {
        double totalBuyAmount = 0.0;
        double avgBuyPrice = 0.0;
        double currentBalance = 0.0;
        double realizedPnL = 0.0;
    }

}
