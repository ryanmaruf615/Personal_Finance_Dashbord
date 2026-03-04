package com.financeapp.repository;

import com.financeapp.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>,
        JpaSpecificationExecutor<Transaction> {

    @Query("SELECT COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) - " +
           "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) " +
           "FROM Transaction t WHERE t.account.id = :accountId")
    BigDecimal calculateBalanceByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT t FROM Transaction t " +
           "JOIN FETCH t.account a " +
           "JOIN FETCH t.category c " +
           "WHERE t.id = :id AND a.user.id = :userId")
    Optional<Transaction> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * Sum all EXPENSE transactions for a specific user + category within a date range.
     * Used by BudgetService to calculate amount spent per category per month.
     */
    @Query("SELECT COALESCE(SUM(t.convertedAmount), 0) FROM Transaction t " +
           "WHERE t.account.user.id = :userId " +
           "AND t.category.id = :categoryId " +
           "AND t.type = 'EXPENSE' " +
           "AND t.transactionDate >= :startDate " +
           "AND t.transactionDate <= :endDate")
    BigDecimal sumExpenseByUserAndCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
