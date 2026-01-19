package com.portfolio.backend.repository;

import com.portfolio.backend.entity.Exchange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExchangeRepository extends JpaRepository<Exchange, Long> {
    Optional<Exchange> findByName(String name);
}
