-- ============================================================
-- V2: Create accounts table
-- ============================================================
-- Each user can have multiple accounts (Checking, Savings, etc.)
-- Balance is NOT stored — it's calculated from transactions.
-- is_archived = soft delete (we never hard-delete because
-- transactions still reference the account).
-- ON DELETE CASCADE: if a user is deleted, their accounts go too.
-- ============================================================

CREATE TABLE accounts (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    type            VARCHAR(20)     NOT NULL,
    currency        VARCHAR(10)     NOT NULL DEFAULT 'EUR',
    is_archived     BOOLEAN         NOT NULL DEFAULT FALSE,
    user_id         BIGINT          NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP,

    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Fast lookup: "get all active accounts for this user"
CREATE INDEX idx_accounts_user_id ON accounts (user_id);
