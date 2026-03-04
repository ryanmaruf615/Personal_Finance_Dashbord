package com.financeapp.dto.request;

import com.financeapp.enums.AccountType;
import com.financeapp.enums.Currency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequest {

    @NotBlank(message = "Account name is required")
    @Size(max = 100, message = "Account name must be at most 100 characters")
    private String name;

    @NotNull(message = "Account type is required")
    private AccountType type;

    private Currency currency;
}
