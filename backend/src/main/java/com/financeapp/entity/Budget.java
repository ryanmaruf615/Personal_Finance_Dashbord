package com.financeapp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Budget entity — a monthly spending limit for a specific category.
 *
 * Example: User sets a €400 budget for "Food" in February 2026.
 * The system then tracks actual spending vs this limit.
 *
 * Key design decisions:
 *
 * - yearMonth stored as String "2026-02" (not a date) because budgets are monthly.
 *   This makes queries simple: WHERE year_month = '2026-02'
 *
 * - UNIQUE constraint on (user_id, category_id, year_month):
 *   A user can only have ONE budget per category per month.
 *   If they try to create a duplicate, we UPDATE instead of INSERT.
 *
 * - amountSpent is NOT stored here — it's calculated at query time by summing
 *   EXPENSE transactions in that category for that month.
 *   This ensures the "spent" amount is always accurate in real-time.
 */
@Entity
@Table(
    name = "budgets",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_budget_user_category_month",
            columnNames = {"user_id", "category_id", "year_month"}
        )
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The maximum amount the user wants to spend in this category this month.
     * Always positive. Stored in the user's preferred currency.
     */
    @Column(name = "amount_limit", nullable = false, precision = 19, scale = 2)
    private BigDecimal amountLimit;

    /**
     * Which month this budget applies to, formatted as "YYYY-MM".
     * Examples: "2026-01", "2026-02", "2026-12"
     */
    @Column(name = "year_month", nullable = false, length = 7)
    private String yearMonth;

    // ---- Relationships ----

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Category category;

    // ---- Timestamps ----

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
