package com.portfolio.backend.service;

import com.portfolio.backend.entity.ManualTransaction;
import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.ManualTransactionRepository;
import com.portfolio.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ManualServiceTest {

    @Mock
    private ManualTransactionRepository manualTransactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ManualService manualService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
    }

    @Test
    void testAddTransaction_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(manualTransactionRepository.save(any(ManualTransaction.class))).thenAnswer(invocation -> {
            ManualTransaction tx = invocation.getArgument(0);
            tx.setId(100L);
            return tx;
        });

        ManualTransaction result = manualService.addTransaction(1L, "BTC", new BigDecimal("1.5"), new BigDecimal("50000"), "BUY");

        assertNotNull(result);
        assertEquals("BTC", result.getSymbol());
        assertEquals(new BigDecimal("1.5"), result.getAmount());
        assertEquals(100L, result.getId());
        verify(manualTransactionRepository, times(1)).save(any(ManualTransaction.class));
    }

    @Test
    void testAddTransaction_UserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            manualService.addTransaction(99L, "BTC", BigDecimal.ONE, BigDecimal.TEN, "BUY");
        });
    }
}
