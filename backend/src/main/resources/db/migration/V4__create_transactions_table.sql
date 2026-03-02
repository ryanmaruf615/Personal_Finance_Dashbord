-- ============================================================
-- V4: Create transactions table
-- ============================================================
-- The core data table — every income/expense is a row here.
--
-- amount:           original amount in the account's currency (always positive)
-- converted_amount: equivalent in EUR for cross-currency analytics
-- type:             'INCOME' or 'EXPENSE' determines the sign
-- transaction_date: when the transaction actually occurred (not when entered)
--
-- Composite index on (account_id, transaction_date) covers the most
-- common query: "show transactions for this account sorted by date"
-- ============================================================

CREATE TABLE transactions (
    id                  BIGSERIAL       PRIMARY KEY,
    amount              DECIMAL(19, 2)  NOT NULL,
    converted_amount    DECIMAL(19, 2),
    currency            VARCHAR(10)     NOT NULL,
    type                VARCHAR(10)     NOT NULL,
    description         VARCHAR(500),
    transaction_date    DATE            NOT NULL,
    account_id          BIGINT          NOT NULL,
    category_id         BIGINT          NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE,

    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Primary query pattern: transactions for an account sorted by date
CREATE INDEX idx_transaction_account_date ON transactions (account_id, transaction_date);

-- Analytics queries often filter by category and type
CREATE INDEX idx_transaction_category ON transactions (category_id);
CREATE INDEX idx_transaction_type ON transactions (type);

-- Date range filtering (e.g., "all transactions in February 2026")
CREATE INDEX idx_transaction_date ON transactions (transaction_date);
