package com.financeapp.entity;

import com.financeapp.enums.Currency;
import com.financeapp.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Transaction entity — a single income or expense record.
 *
 * This is the core data model of the entire application.
 * Every financial event (salary received, grocery purchased, etc.) is a Transaction.
 *
 * Key design decisions:
 *
 * - amount: the original amount in the account's currency
 *   Always stored as a POSITIVE number. The type field (INCOME/EXPENSE) determines the sign.
 *
 * - convertedAmount: the equivalent amount in EUR (base currency)
 *   Used for analytics so we can sum transactions across different currencies.
 *   Calculated automatically when a transaction is created, using CurrencyService.
 *
 * - transactionDate: the date the transaction actually occurred
 *   (separate from createdAt, which is when the record was entered into the system)
 *
 * - BigDecimal for money: NEVER use float/double for financial calculations.
 *   BigDecimal provides exact decimal arithmetic with no rounding errors.
 */
@Entity
@Table(
    name = "transactions",
    indexes = {
        // Composite index for the most common query pattern:
        // "Get all transactions for an account, sorted by date"
        @Index(name = "idx_transaction_account_date", columnList = "account_id, transaction_date")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Original amount in the account's currency.
     * Always positive — use 'type' field to determine income vs expense.
     * precision=19, scale=2 supports values up to 99,999,999,999,999,999.99
     */
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /**
     * Amount converted to EUR (base currency) for cross-currency analytics.
     * If the account is already in EUR, this equals 'amount'.
     */
    @Column(name = "converted_amount", precision = 19, scale = 2)
    private BigDecimal convertedAmount;

    /**
     * Currency of this transaction (copied from the account at creation time).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Currency currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    /**
     * Optional description — "Lidl Grocery", "Monthly Salary", "Netflix", etc.
     */
    @Column(length = 500)
    private String description;

    /**
     * The actual date the transaction occurred.
     * Could be in the past (entering old transactions) or today.
     */
    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    // ---- Relationships ----

    /**
     * The account this transaction belongs to.
     * A transaction always belongs to exactly one account.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Account account;

    /**
     * The category classifying this transaction (Food, Transport, Salary, etc.)
     * A transaction always has exactly one category.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Category category;

    // ---- Timestamps ----

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
