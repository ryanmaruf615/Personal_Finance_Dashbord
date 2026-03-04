package com.financeapp.repository;

import com.financeapp.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Returns all categories available to a user:
     * - Default categories (isDefault = true, user = null)
     * - User's custom categories (isDefault = false, user.id = userId)
     */
    @Query("SELECT c FROM Category c WHERE c.isDefault = true OR c.user.id = :userId ORDER BY c.isDefault DESC, c.name ASC")
    List<Category> findAllAvailableForUser(@Param("userId") Long userId);

    /**
     * Find a specific category that the user can access (default OR owned).
     */
    @Query("SELECT c FROM Category c WHERE c.id = :id AND (c.isDefault = true OR c.user.id = :userId)")
    Optional<Category> findByIdAndAccessibleByUser(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * Find only custom categories created by a specific user.
     */
    List<Category> findByUserIdAndIsDefaultFalseOrderByNameAsc(Long userId);

    boolean existsByNameAndUserIdAndIsDefaultFalse(String name, Long userId);
}
