package com.financeapp.dto.response;

import com.financeapp.entity.Account;
import com.financeapp.enums.AccountType;
import com.financeapp.enums.Currency;
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
public class AccountResponse {

    private Long id;
    private String name;
    private AccountType type;
    private Currency currency;
    private BigDecimal balance;
    private Boolean isArchived;
    private LocalDateTime createdAt;

    public static AccountResponse fromEntity(Account account, BigDecimal balance) {
        return AccountResponse.builder()
                .id(account.getId())
                .name(account.getName())
                .type(account.getType())
                .currency(account.getCurrency())
                .balance(balance)
                .isArchived(account.getIsArchived())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
