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
public class BudgetStatusResponse {

    private Long budgetId;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal amountLimit;
    private BigDecimal amountSpent;
    private BigDecimal amountRemaining;
    private double percentage;
    private boolean overBudget;
    private String yearMonth;
}
