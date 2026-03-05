package com.financeapp.service;

import com.financeapp.dto.response.AdminStatsResponse;
import com.financeapp.dto.response.UserResponse;
import com.financeapp.repository.AccountRepository;
import com.financeapp.repository.BudgetRepository;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BudgetRepository budgetRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalTransactions = transactionRepository.count();
        long totalAccounts = accountRepository.count();
        long totalBudgets = budgetRepository.count();

        // Calculate total income and expenses across all users
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        List<Object[]> totals = transactionRepository.getAllUsersTotals();
        if (totals != null && !totals.isEmpty() && totals.get(0) != null) {
            Object[] row = totals.get(0);
            if (row[0] != null) totalIncome = toBigDecimal(row[0]);
            if (row[1] != null) totalExpenses = toBigDecimal(row[1]);
        }

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalTransactions(totalTransactions)
                .totalAccounts(totalAccounts)
                .totalBudgets(totalBudgets)
                .totalIncomeAllUsers(totalIncome)
                .totalExpensesAllUsers(totalExpenses)
                .build();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        return new BigDecimal(value.toString());
    }
}
