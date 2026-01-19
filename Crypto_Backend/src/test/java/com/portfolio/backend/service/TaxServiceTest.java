package com.portfolio.backend.service;

import com.portfolio.backend.entity.ManualTransaction;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class TaxServiceTest {

    @Test
    public void testCalculateRealizedPnl_Simple() {
        TaxService taxService = new TaxService();
        List<ManualTransaction> txs = new ArrayList<>();

        // Buy 1 BTC @ 10,000
        ManualTransaction buy1 = new ManualTransaction();
        buy1.setSymbol("BTC");
        buy1.setAmount(new BigDecimal("1"));
        buy1.setPrice(new BigDecimal("10000"));
        buy1.setDate(LocalDateTime.of(2023, 1, 1, 10, 0));
        buy1.setType(ManualTransaction.TransactionType.BUY);
        txs.add(buy1);

        // Sell 0.5 BTC @ 20,000 (Profit 5000)
        ManualTransaction sell1 = new ManualTransaction();
        sell1.setSymbol("BTC");
        sell1.setAmount(new BigDecimal("0.5"));
        sell1.setPrice(new BigDecimal("20000"));
        sell1.setDate(LocalDateTime.of(2023, 6, 1, 10, 0));
        sell1.setType(ManualTransaction.TransactionType.SELL);
        txs.add(sell1);

        Map<String, Object> result = taxService.calculateRealizedPnl(txs, 2023); // Year 2023
        
        BigDecimal pnl = (BigDecimal) result.get("totalRealizedPnl");
        assertEquals(0, new BigDecimal("5000.0").compareTo(pnl), "PnL should be 5000");
    }
}
