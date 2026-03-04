package com.financeapp.dto.response;

import com.financeapp.entity.Budget;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal amountLimit;
    private String yearMonth;
    private LocalDateTime createdAt;

    public static BudgetResponse fromEntity(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .categoryIcon(budget.getCategory().getIcon().getIconName())
                .amountLimit(budget.getAmountLimit())
                .yearMonth(budget.getYearMonth())
                .createdAt(budget.getCreatedAt())
                .build();
    }
}
