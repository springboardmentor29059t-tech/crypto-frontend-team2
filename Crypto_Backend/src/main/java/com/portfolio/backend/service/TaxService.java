package com.portfolio.backend.service;

import com.portfolio.backend.entity.ManualTransaction;
import com.portfolio.backend.entity.ManualTransaction.TransactionType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class TaxService {

    public Map<String, Object> calculateRealizedPnl(List<ManualTransaction> transactions, int year) {
        BigDecimal totalRealizedPnl = BigDecimal.ZERO;
        List<Map<String, Object>> taxableEvents = new ArrayList<>();

        // Group by symbol to handle FIFO per asset
        Map<String, List<ManualTransaction>> transactionsBySymbol = new HashMap<>();
        for (ManualTransaction tx : transactions) {
            // Filter by year if needed, but for FIFO we need history. 
            // Better to process ALL history to get correct cost basis, then filter realized events by year.
            transactionsBySymbol.computeIfAbsent(tx.getSymbol(), k -> new ArrayList<>()).add(tx);
        }

        for (String symbol : transactionsBySymbol.keySet()) {
            List<ManualTransaction> symbolTxs = transactionsBySymbol.get(symbol);
            symbolTxs.sort(Comparator.comparing(ManualTransaction::getDate));

            Deque<BuyingLot> buyQueue = new ArrayDeque<>();

            for (ManualTransaction tx : symbolTxs) {
                if (tx.getType() == TransactionType.BUY || tx.getType() == TransactionType.DEPOSIT) {
                    // Add to queue
                    buyQueue.add(new BuyingLot(tx.getAmount(), tx.getPrice(), tx.getDate()));
                } else if (tx.getType() == TransactionType.SELL || tx.getType() == TransactionType.WITHDRAW) {
                    BigDecimal sellAmount = tx.getAmount();
                    BigDecimal sellPrice = tx.getPrice(); // For Withdraw, might be 0 or market price, assuming User enters realized value or treating as 0 realized? 
                    // Usually withdrawals aren't taxable events unless spent. But let's assume SELL is the main taxable event.
                    // If WITHDRAW, maybe just remove from pool without realizing PnL? Or assume valid exit?
                    // For simplicity, let's treat SELL as taxable. WITHDRAW reduces quantity but PnL unknown? 
                    // Let's stick to SELL for PnL. Withdrawals might just reduce stack if it's transfer to self.
                    // If it's spending, it's a sell. 
                    
                    if (tx.getType() == TransactionType.WITHDRAW) {
                        // Just remove strictly from stack?? Simple FIFO removal
                        while (sellAmount.compareTo(BigDecimal.ZERO) > 0 && !buyQueue.isEmpty()) {
                             BuyingLot lot = buyQueue.peek();
                             if (lot.amount.compareTo(sellAmount) <= 0) {
                                 sellAmount = sellAmount.subtract(lot.amount);
                                 buyQueue.poll();
                             } else {
                                 lot.amount = lot.amount.subtract(sellAmount);
                                 sellAmount = BigDecimal.ZERO;
                             }
                        }
                        continue; 
                    }

                    BigDecimal txPnl = BigDecimal.ZERO;
                    String buyDates = "";

                    while (sellAmount.compareTo(BigDecimal.ZERO) > 0 && !buyQueue.isEmpty()) {
                        BuyingLot lot = buyQueue.peek();
                        BigDecimal matchAmount = lot.amount.min(sellAmount);
                        
                        BigDecimal costBasis = lot.price.multiply(matchAmount);
                        BigDecimal proceeds = sellPrice.multiply(matchAmount);
                        
                        txPnl = txPnl.add(proceeds.subtract(costBasis));
                        
                        lot.amount = lot.amount.subtract(matchAmount);
                        sellAmount = sellAmount.subtract(matchAmount);
                        
                        if (lot.amount.compareTo(BigDecimal.ZERO) == 0) {
                            buyQueue.poll();
                        }
                    }

                    // Check if event happened in the requested year
                    if (tx.getDate().getYear() == year) {
                        totalRealizedPnl = totalRealizedPnl.add(txPnl);
                        
                        Map<String, Object> event = new HashMap<>();
                        event.put("date", tx.getDate());
                        event.put("symbol", symbol);
                        event.put("type", "SELL");
                        event.put("amount", tx.getAmount().subtract(sellAmount)); // Actual sold amount matched
                        event.put("pnl", txPnl);
                        taxableEvents.add(event);
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("totalRealizedPnl", totalRealizedPnl);
        result.put("events", taxableEvents);

        return result;
    }

    private static class BuyingLot {
        BigDecimal amount;
        BigDecimal price;
        java.time.LocalDateTime date;

        public BuyingLot(BigDecimal amount, BigDecimal price, java.time.LocalDateTime date) {
            this.amount = amount;
            this.price = price;
            this.date = date;
        }
    }
}
