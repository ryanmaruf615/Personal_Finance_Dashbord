package com.financeapp.repository;

import com.financeapp.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserIdAndIsArchivedFalseOrderByCreatedAtDesc(Long userId);

    List<Account> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Account> findByIdAndUserId(Long id, Long userId);

    boolean existsByNameAndUserId(String name, Long userId);

    @Query("SELECT COUNT(a) FROM Account a WHERE a.user.id = :userId AND a.isArchived = false")
    long countActiveByUserId(@Param("userId") Long userId);
}
