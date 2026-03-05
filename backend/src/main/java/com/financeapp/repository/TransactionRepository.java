package com.financeapp.repository;

import com.financeapp.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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

    // ─── Analytics Queries ──────────────────────────────────────────

    @Query(value = "SELECT TO_CHAR(t.transaction_date, 'YYYY-MM') AS month, " +
           "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.converted_amount ELSE 0 END), 0) AS income, " +
           "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.converted_amount ELSE 0 END), 0) AS expenses " +
           "FROM transactions t " +
           "JOIN accounts a ON t.account_id = a.id " +
           "WHERE a.user_id = :userId " +
           "AND t.transaction_date >= :startDate " +
           "GROUP BY TO_CHAR(t.transaction_date, 'YYYY-MM') " +
           "ORDER BY month ASC",
           nativeQuery = true)
    List<Object[]> getMonthlySummary(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate
    );

    @Query(value = "SELECT c.id AS category_id, c.name AS category_name, c.icon, " +
           "COALESCE(SUM(t.converted_amount), 0) AS total_amount " +
           "FROM transactions t " +
           "JOIN accounts a ON t.account_id = a.id " +
           "JOIN categories c ON t.category_id = c.id " +
           "WHERE a.user_id = :userId " +
           "AND t.type = 'EXPENSE' " +
           "AND t.transaction_date >= :startDate " +
           "AND t.transaction_date <= :endDate " +
           "GROUP BY c.id, c.name, c.icon " +
           "ORDER BY total_amount DESC",
           nativeQuery = true)
    List<Object[]> getCategoryBreakdown(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = "SELECT t.transaction_date, " +
           "COALESCE(SUM(t.converted_amount), 0) AS total_amount " +
           "FROM transactions t " +
           "JOIN accounts a ON t.account_id = a.id " +
           "WHERE a.user_id = :userId " +
           "AND t.type = 'EXPENSE' " +
           "AND t.transaction_date >= :startDate " +
           "AND t.transaction_date <= :endDate " +
           "GROUP BY t.transaction_date " +
           "ORDER BY t.transaction_date ASC",
           nativeQuery = true)
    List<Object[]> getDailySpending(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = "SELECT c.id AS category_id, c.name AS category_name, c.icon, " +
           "COALESCE(SUM(t.converted_amount), 0) AS total_amount, " +
           "COUNT(t.id) AS tx_count " +
           "FROM transactions t " +
           "JOIN accounts a ON t.account_id = a.id " +
           "JOIN categories c ON t.category_id = c.id " +
           "WHERE a.user_id = :userId " +
           "AND t.type = 'EXPENSE' " +
           "AND t.transaction_date >= :startDate " +
           "AND t.transaction_date <= :endDate " +
           "GROUP BY c.id, c.name, c.icon " +
           "ORDER BY total_amount DESC " +
           "LIMIT :lim",
           nativeQuery = true)
    List<Object[]> getTopCategories(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("lim") int limit
    );

    @Query(value = "SELECT " +
           "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.converted_amount ELSE 0 END), 0) AS income, " +
           "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.converted_amount ELSE 0 END), 0) AS expenses " +
           "FROM transactions t " +
           "JOIN accounts a ON t.account_id = a.id " +
           "WHERE a.user_id = :userId " +
           "AND t.transaction_date >= :startDate " +
           "AND t.transaction_date <= :endDate",
           nativeQuery = true)
    Object[] getMonthTotals(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // ─── Admin Query ────────────────────────────────────────────────

    @Query(value = "SELECT " +
           "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.converted_amount ELSE 0 END), 0) AS total_income, " +
           "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.converted_amount ELSE 0 END), 0) AS total_expenses " +
           "FROM transactions t",
           nativeQuery = true)
    List<Object[]> getAllUsersTotals();
}
