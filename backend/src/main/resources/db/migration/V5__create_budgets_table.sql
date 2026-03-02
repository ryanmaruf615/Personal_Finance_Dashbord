-- ============================================================
-- V5: Create budgets table
-- ============================================================
-- A budget is a monthly spending limit for a specific category.
-- Example: "Food budget for Feb 2026 = €400"
--
-- year_month: stored as 'YYYY-MM' string (e.g., '2026-02')
--   → Simple equality checks: WHERE year_month = '2026-02'
--
-- UNIQUE constraint ensures a user can only set ONE budget
-- per category per month. The service layer does "upsert":
-- if it exists → update, if not → insert.
-- ============================================================

CREATE TABLE budgets (
    id              BIGSERIAL       PRIMARY KEY,
    amount_limit    DECIMAL(19, 2)  NOT NULL,
    year_month      VARCHAR(7)      NOT NULL,
    user_id         BIGINT          NOT NULL,
    category_id     BIGINT          NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP,

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT fk_budgets_category
        FOREIGN KEY (category_id) REFERENCES categories (id),

    -- One budget per user per category per month
    CONSTRAINT uk_budget_user_category_month
        UNIQUE (user_id, category_id, year_month)
);

-- Fast lookup: "get all budgets for this user in this month"
CREATE INDEX idx_budgets_user_month ON budgets (user_id, year_month);
