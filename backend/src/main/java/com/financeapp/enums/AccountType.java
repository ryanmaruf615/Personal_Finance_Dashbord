package com.financeapp.enums;

/**
 * Types of financial accounts a user can create.
 * Each type has a display label for the frontend.
 */
public enum AccountType {
    CHECKING("Checking Account"),
    SAVINGS("Savings Account"),
    CASH("Cash"),
    CREDIT_CARD("Credit Card");

    private final String displayName;

    AccountType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
