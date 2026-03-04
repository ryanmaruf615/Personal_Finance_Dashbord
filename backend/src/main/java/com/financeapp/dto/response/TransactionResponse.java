package com.financeapp.dto.response;

import com.financeapp.entity.Transaction;
import com.financeapp.enums.Currency;
import com.financeapp.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private BigDecimal convertedAmount;
    private Currency currency;
    private TransactionType type;
    private String description;
    private LocalDate transactionDate;
    private Long accountId;
    private String accountName;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private LocalDateTime createdAt;

    public static TransactionResponse fromEntity(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .convertedAmount(t.getConvertedAmount())
                .currency(t.getCurrency())
                .type(t.getType())
                .description(t.getDescription())
                .transactionDate(t.getTransactionDate())
                .accountId(t.getAccount().getId())
                .accountName(t.getAccount().getName())
                .categoryId(t.getCategory().getId())
                .categoryName(t.getCategory().getName())
                .categoryIcon(t.getCategory().getIcon().getIconName())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
