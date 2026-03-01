package com.financeapp.enums;

/**
 * Supported currencies for accounts and transactions.
 * Each currency stores its ISO code and display symbol.
 * EUR is the base currency used for convertedAmount calculations.
 */
public enum Currency {
    EUR("EUR", "€"),
    USD("USD", "$"),
    GBP("GBP", "£"),
    CHF("CHF", "CHF"),
    PLN("PLN", "zł");

    private final String code;
    private final String symbol;

    Currency(String code, String symbol) {
        this.code = code;
        this.symbol = symbol;
    }

    public String getCode() {
        return code;
    }

    public String getSymbol() {
        return symbol;
    }
}
