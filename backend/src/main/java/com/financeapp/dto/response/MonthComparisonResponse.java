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
public class MonthComparisonResponse {

    private MonthlySummaryResponse month1;
    private MonthlySummaryResponse month2;
    private BigDecimal incomeChange;
    private BigDecimal expenseChange;
    private BigDecimal netChange;
    private double incomeChangePercent;
    private double expenseChangePercent;
}
