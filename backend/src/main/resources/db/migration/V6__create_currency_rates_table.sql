-- ============================================================
-- V6: Create currency_rates table
-- ============================================================
-- Stores exchange rates between currency pairs.
-- Used by CurrencyService to convert amounts to EUR (base currency).
--
-- Example: EUR → USD, rate = 1.08 means 1 EUR = 1.08 USD
-- For MVP, rates are static (seeded in V8).
-- Future enhancement: fetch live rates from an API.
-- ============================================================

CREATE TABLE currency_rates (
    id              BIGSERIAL       PRIMARY KEY,
    from_currency   VARCHAR(10)     NOT NULL,
    to_currency     VARCHAR(10)     NOT NULL,
    rate            DECIMAL(19, 6)  NOT NULL,
    effective_date  DATE            NOT NULL
);

-- Lookup pattern: "what's the rate from EUR to USD?"
CREATE INDEX idx_currency_rates_pair ON currency_rates (from_currency, to_currency);
