package com.financeapp.repository;

import com.financeapp.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    @Query("SELECT b FROM Budget b " +
           "JOIN FETCH b.category c " +
           "WHERE b.user.id = :userId AND b.yearMonth = :yearMonth " +
           "ORDER BY c.name ASC")
    List<Budget> findByUserIdAndYearMonth(
            @Param("userId") Long userId,
            @Param("yearMonth") String yearMonth
    );

    @Query("SELECT b FROM Budget b " +
           "WHERE b.user.id = :userId AND b.category.id = :categoryId AND b.yearMonth = :yearMonth")
    Optional<Budget> findByUserIdAndCategoryIdAndYearMonth(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("yearMonth") String yearMonth
    );

    @Query("SELECT b FROM Budget b " +
           "JOIN FETCH b.category c " +
           "WHERE b.id = :id AND b.user.id = :userId")
    Optional<Budget> findByIdAndUserId(
            @Param("id") Long id,
            @Param("userId") Long userId
    );
}
