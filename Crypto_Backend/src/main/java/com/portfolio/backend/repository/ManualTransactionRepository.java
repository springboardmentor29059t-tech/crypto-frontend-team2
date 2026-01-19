package com.portfolio.backend.repository;

import com.portfolio.backend.entity.ManualTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ManualTransactionRepository extends JpaRepository<ManualTransaction, Long> {
    List<ManualTransaction> findByUserId(Long userId);
    List<ManualTransaction> findByUserIdAndSymbol(Long userId, String symbol);
}
