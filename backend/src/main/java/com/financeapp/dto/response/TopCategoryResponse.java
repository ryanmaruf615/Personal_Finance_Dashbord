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
public class TopCategoryResponse {

    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal amount;
    private long transactionCount;
}
