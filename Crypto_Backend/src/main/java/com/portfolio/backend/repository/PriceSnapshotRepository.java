package com.portfolio.backend.repository;

import com.portfolio.backend.entity.PriceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface PriceSnapshotRepository extends JpaRepository<PriceSnapshot, Long> {
    List<PriceSnapshot> findBySymbolAndTimestampAfter(String symbol, LocalDateTime timestamp);
}
