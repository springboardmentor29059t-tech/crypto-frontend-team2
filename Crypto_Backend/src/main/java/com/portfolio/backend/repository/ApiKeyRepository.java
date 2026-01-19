package com.portfolio.backend.repository;

import com.portfolio.backend.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    List<ApiKey> findByUserId(Long userId);
    Optional<ApiKey> findByUserIdAndExchangeId(Long userId, Long exchangeId);
}
