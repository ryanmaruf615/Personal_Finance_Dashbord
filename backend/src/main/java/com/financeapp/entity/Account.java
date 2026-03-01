package com.financeapp.entity;

import com.financeapp.enums.AccountType;
import com.financeapp.enums.Currency;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Account entity — represents a financial account belonging to a user.
 *
 * Examples: "Main Checking" (EUR), "Savings" (EUR), "USD Cash"
 *
 * Key design decisions:
 * - Soft delete via isArchived (never hard-delete accounts because transactions reference them)
 * - Balance is NOT stored here — it's calculated from transactions at query time
 *   (this avoids sync issues and ensures accuracy)
 * - Each account has its own currency (supports multi-currency users)
 * - cascade = ALL on transactions: when account is deleted, its transactions go too
 * - orphanRemoval = true: removing a transaction from the list deletes it from DB
 */
@Entity
@Table(name = "accounts")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Currency currency = Currency.EUR;

    @Column(name = "is_archived", nullable = false)
    @Builder.Default
    private Boolean isArchived = false;

    // ---- Relationships ----

    /**
     * The user who owns this account.
     * LAZY fetch: user data is only loaded when explicitly accessed.
     * This is critical for performance when loading lists of accounts.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * All transactions belonging to this account.
     * mappedBy = "account" means Transaction.account is the owning side.
     * We rarely load this collection directly (we use repository queries instead),
     * but it's here for completeness and cascade operations.
     */
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude  // prevent infinite loop: Account.toString() → Transaction.toString() → Account.toString()
    @EqualsAndHashCode.Exclude
    private List<Transaction> transactions = new ArrayList<>();

    // ---- Timestamps ----

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
