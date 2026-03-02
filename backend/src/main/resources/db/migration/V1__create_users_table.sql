-- ============================================================
-- V1: Create users table
-- ============================================================
-- Central identity table. Email is the login username.
-- Password is stored as a BCrypt hash (never plain text).
-- role: 'ROLE_USER' or 'ROLE_ADMIN'
-- preferred_currency: defaults to 'EUR' for the German market
-- ============================================================

CREATE TABLE users (
    id                  BIGSERIAL       PRIMARY KEY,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    password            VARCHAR(255)    NOT NULL,
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    role                VARCHAR(20)     NOT NULL DEFAULT 'ROLE_USER',
    preferred_currency  VARCHAR(10)     NOT NULL DEFAULT 'EUR',
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP
);

-- Index for login lookups (email is already UNIQUE, which creates an index,
-- but being explicit helps future developers understand the query pattern)
CREATE INDEX idx_users_email ON users (email);
