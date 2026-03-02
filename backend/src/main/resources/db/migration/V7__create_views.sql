-- ============================================================
-- V7: Create analytics views
-- ============================================================
-- These views pre-define the SQL for common analytics queries.
-- They don't store data — they're just saved queries.
-- The AnalyticsService can query these directly for performance.
--
-- Note: We join through accounts to get the user_id because
-- transactions don't have a direct user_id column.
-- The path is: Transaction → Account → User
-- ============================================================

-- View 1: Monthly summary per user
-- Aggregates income and expense totals by month
-- Used by: GET /api/analytics/monthly-summary
CREATE OR REPLACE VIEW monthly_summary_view AS
SELECT
    a.user_id                                           AS user_id,
    TO_CHAR(t.transaction_date, 'YYYY-MM')              AS month,
    t.type                                              AS type,
    SUM(t.converted_amount)                             AS total_amount,
    COUNT(*)                                            AS transaction_count
FROM transactions t
    JOIN accounts a ON t.account_id = a.id
WHERE a.is_archived = FALSE
GROUP BY a.user_id, TO_CHAR(t.transaction_date, 'YYYY-MM'), t.type;


-- View 2: Category spending per user per month
-- Breaks down expenses by category for pie charts
-- Used by: GET /api/analytics/category-breakdown
CREATE OR REPLACE VIEW category_spending_view AS
SELECT
    a.user_id                                           AS user_id,
    TO_CHAR(t.transaction_date, 'YYYY-MM')              AS month,
    t.category_id                                       AS category_id,
    c.name                                              AS category_name,
    c.icon                                              AS category_icon,
    SUM(t.converted_amount)                             AS total_amount,
    COUNT(*)                                            AS transaction_count
FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN categories c ON t.category_id = c.id
WHERE t.type = 'EXPENSE'
  AND a.is_archived = FALSE
GROUP BY a.user_id, TO_CHAR(t.transaction_date, 'YYYY-MM'), t.category_id, c.name, c.icon;
