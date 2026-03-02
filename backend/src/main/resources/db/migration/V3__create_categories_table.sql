-- ============================================================
-- V3: Create categories table
-- ============================================================
-- Two kinds of categories:
--   1. Default (is_default=true, user_id=NULL) — shared by all users
--      Example: Food, Transport, Housing (seeded in V8)
--   2. Custom  (is_default=false, user_id=<owner>) — user-created
--
-- user_id is NULLABLE: NULL means it's a system default.
-- ON DELETE CASCADE: if a user is deleted, their custom categories go too.
-- ============================================================

CREATE TABLE categories (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    icon            VARCHAR(50)     NOT NULL,
    is_default      BOOLEAN         NOT NULL DEFAULT FALSE,
    user_id         BIGINT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Fast lookup: "get all categories visible to this user"
-- (WHERE is_default = true OR user_id = ?)
CREATE INDEX idx_categories_user_id ON categories (user_id);
CREATE INDEX idx_categories_is_default ON categories (is_default);
