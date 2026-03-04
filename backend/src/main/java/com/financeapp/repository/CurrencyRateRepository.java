package com.financeapp.repository;

import com.financeapp.entity.CurrencyRate;
import com.financeapp.enums.Currency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CurrencyRateRepository extends JpaRepository<CurrencyRate, Long> {

    Optional<CurrencyRate> findTopByFromCurrencyAndToCurrencyOrderByEffectiveDateDesc(
            Currency fromCurrency, Currency toCurrency
    );
}
