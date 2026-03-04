package com.financeapp.specification;

import com.financeapp.entity.Account;
import com.financeapp.entity.Transaction;
import com.financeapp.enums.TransactionType;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class TransactionSpecification {

    private TransactionSpecification() {}

    /**
     * Filter transactions belonging to a specific user (via account.user.id).
     */
    public static Specification<Transaction> belongsToUser(Long userId) {
        return (root, query, cb) -> {
            Join<Transaction, Account> account = root.join("account");
            return cb.equal(account.get("user").get("id"), userId);
        };
    }

    /**
     * Filter by specific account.
     */
    public static Specification<Transaction> hasAccountId(Long accountId) {
        return (root, query, cb) ->
                cb.equal(root.get("account").get("id"), accountId);
    }

    /**
     * Filter by specific category.
     */
    public static Specification<Transaction> hasCategoryId(Long categoryId) {
        return (root, query, cb) ->
                cb.equal(root.get("category").get("id"), categoryId);
    }

    /**
     * Filter by transaction type (INCOME or EXPENSE).
     */
    public static Specification<Transaction> hasType(TransactionType type) {
        return (root, query, cb) ->
                cb.equal(root.get("type"), type);
    }

    /**
     * Filter transactions on or after startDate.
     */
    public static Specification<Transaction> afterDate(LocalDate startDate) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("transactionDate"), startDate);
    }

    /**
     * Filter transactions on or before endDate.
     */
    public static Specification<Transaction> beforeDate(LocalDate endDate) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("transactionDate"), endDate);
    }

    /**
     * Search description (case-insensitive LIKE).
     */
    public static Specification<Transaction> descriptionContains(String search) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("description")),
                        "%" + search.toLowerCase().trim() + "%");
    }
}
