package com.financeapp.entity;

import com.financeapp.enums.Currency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * CurrencyRate entity — stores exchange rates between currency pairs.
 *
 * Used by CurrencyService to convert transaction amounts to EUR (base currency).
 *
 * Example rows:
 *   EUR → USD  rate=1.08  (1 EUR = 1.08 USD)
 *   USD → EUR  rate=0.926 (1 USD = 0.926 EUR)
 *   EUR → GBP  rate=0.86
 *
 * Key design decisions:
 * - Rates are seeded by Flyway migration V8 with reasonable defaults
 * - effectiveDate allows historical rate tracking (future enhancement)
 * - For MVP, we use static rates. A future version could fetch live rates from an API.
 * - scale=6 on rate gives sufficient precision for currency conversions
 */
@Entity
@Table(name = "currency_rates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_currency", nullable = false)
    private Currency fromCurrency;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_currency", nullable = false)
    private Currency toCurrency;

    /**
     * Exchange rate: 1 unit of fromCurrency = rate units of toCurrency.
     * Example: fromCurrency=EUR, toCurrency=USD, rate=1.08
     *          means 1 EUR = 1.08 USD
     * scale=6 provides precision for fractional rates.
     */
    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal rate;

    /**
     * The date this rate is effective from.
     * For MVP we use a single static date. Future versions could
     * store daily rates fetched from an exchange rate API.
     */
    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;
}
