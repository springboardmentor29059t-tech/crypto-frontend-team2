package com.portfolio.backend.repository;

import com.portfolio.backend.entity.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {
    List<PriceAlert> findByUserId(Long userId);
    List<PriceAlert> findByIsActiveTrue();
}
