package com.financeapp.service;

import com.financeapp.entity.CurrencyRate;
import com.financeapp.enums.Currency;
import com.financeapp.repository.CurrencyRateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyService {

    private final CurrencyRateRepository currencyRateRepository;

    /**
     * Convert an amount from one currency to another.
     * If from and to are the same, returns the original amount.
     * Falls back to 1:1 rate if no rate is found in DB.
     */
    public BigDecimal convert(BigDecimal amount, Currency from, Currency to) {
        if (from == to) {
            return amount;
        }

        BigDecimal rate = getRate(from, to);
        BigDecimal converted = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        log.debug("Converted {} {} -> {} {} (rate: {})", amount, from, converted, to, rate);
        return converted;
    }

    /**
     * Convert amount to EUR (base currency).
     */
    public BigDecimal convertToEur(BigDecimal amount, Currency from) {
        return convert(amount, from, Currency.EUR);
    }

    /**
     * Get exchange rate from DB. Returns 1.0 as fallback.
     */
    private BigDecimal getRate(Currency from, Currency to) {
        return currencyRateRepository
                .findTopByFromCurrencyAndToCurrencyOrderByEffectiveDateDesc(from, to)
                .map(CurrencyRate::getRate)
                .orElseGet(() -> {
                    log.warn("No exchange rate found for {} -> {}. Using 1:1 fallback.", from, to);
                    return BigDecimal.ONE;
                });
    }
}
