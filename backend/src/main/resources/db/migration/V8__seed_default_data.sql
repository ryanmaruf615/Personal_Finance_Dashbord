-- ============================================================
-- V8: Seed default data
-- ============================================================
-- This migration populates the database with essential starting data:
-- 1. 12 default transaction categories (available to all users)
-- 2. Currency exchange rates (EUR as base currency)
-- 3. Admin user for platform management
-- ============================================================


-- ============================================================
-- 1. DEFAULT CATEGORIES
-- ============================================================
-- is_default = TRUE, user_id = NULL → shared by all users
-- icon values map to lucide-react icon names on the frontend

INSERT INTO categories (name, icon, is_default, user_id, created_at) VALUES
    ('Food',            'FOOD',           TRUE, NULL, CURRENT_TIMESTAMP),
    ('Transport',       'TRANSPORT',      TRUE, NULL, CURRENT_TIMESTAMP),
    ('Housing',         'HOUSING',        TRUE, NULL, CURRENT_TIMESTAMP),
    ('Salary',          'SALARY',         TRUE, NULL, CURRENT_TIMESTAMP),
    ('Entertainment',   'ENTERTAINMENT',  TRUE, NULL, CURRENT_TIMESTAMP),
    ('Health',          'HEALTH',         TRUE, NULL, CURRENT_TIMESTAMP),
    ('Shopping',        'SHOPPING',       TRUE, NULL, CURRENT_TIMESTAMP),
    ('Utilities',       'UTILITIES',      TRUE, NULL, CURRENT_TIMESTAMP),
    ('Education',       'EDUCATION',      TRUE, NULL, CURRENT_TIMESTAMP),
    ('Travel',          'TRAVEL',         TRUE, NULL, CURRENT_TIMESTAMP),
    ('Gifts',           'GIFT',           TRUE, NULL, CURRENT_TIMESTAMP),
    ('Other',           'OTHER',          TRUE, NULL, CURRENT_TIMESTAMP);


-- ============================================================
-- 2. CURRENCY EXCHANGE RATES
-- ============================================================
-- EUR is the base currency. All rates are relative to EUR.
-- These are approximate rates for demonstration purposes.
-- A production app would fetch live rates from an API.
--
-- Forward rates: EUR → other currencies
-- Inverse rates: other currencies → EUR

INSERT INTO currency_rates (from_currency, to_currency, rate, effective_date) VALUES
    -- EUR to others
    ('EUR', 'USD', 1.080000, '2026-01-01'),
    ('EUR', 'GBP', 0.860000, '2026-01-01'),
    ('EUR', 'CHF', 0.950000, '2026-01-01'),
    ('EUR', 'PLN', 4.320000, '2026-01-01'),

    -- Others to EUR (inverse rates)
    ('USD', 'EUR', 0.925926, '2026-01-01'),
    ('GBP', 'EUR', 1.162791, '2026-01-01'),
    ('CHF', 'EUR', 1.052632, '2026-01-01'),
    ('PLN', 'EUR', 0.231481, '2026-01-01'),

    -- Cross rates (USD to others, for convenience)
    ('USD', 'GBP', 0.796296, '2026-01-01'),
    ('GBP', 'USD', 1.255814, '2026-01-01'),
    ('USD', 'CHF', 0.879630, '2026-01-01'),
    ('CHF', 'USD', 1.136842, '2026-01-01');


-- ============================================================
-- 3. ADMIN USER
-- ============================================================
-- Email:    admin@financeapp.com
-- Password: admin123 (BCrypt hash below)
--
-- BCrypt hash generated with strength 10:
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- This is a standard BCrypt hash of the string "admin123"
--
-- IMPORTANT: Change this password in production!

INSERT INTO users (email, password, first_name, last_name, role, preferred_currency, created_at) VALUES
    ('admin@financeapp.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Admin',
     'User',
     'ROLE_ADMIN',
     'EUR',
     CURRENT_TIMESTAMP);
