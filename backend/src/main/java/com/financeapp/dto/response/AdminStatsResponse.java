package com.financeapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalUsers;
    private long totalTransactions;
    private long totalAccounts;
    private long totalBudgets;
    private BigDecimal totalIncomeAllUsers;
    private BigDecimal totalExpensesAllUsers;
}
