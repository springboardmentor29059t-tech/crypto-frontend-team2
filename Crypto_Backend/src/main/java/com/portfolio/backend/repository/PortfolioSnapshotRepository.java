package com.portfolio.backend.repository;

import com.portfolio.backend.entity.PortfolioSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioSnapshotRepository extends JpaRepository<PortfolioSnapshot, Long> {
    List<PortfolioSnapshot> findByUserIdOrderByTimestampAsc(Long userId);
    
    PortfolioSnapshot findTopByUserIdAndTimestampLessThanEqualOrderByTimestampDesc(Long userId, java.time.LocalDateTime timestamp);
}
