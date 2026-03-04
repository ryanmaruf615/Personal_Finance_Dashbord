package com.financeapp.controller;

import com.financeapp.dto.request.AccountRequest;
import com.financeapp.dto.response.AccountResponse;
import com.financeapp.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Manage financial accounts")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    @Operation(summary = "Get all accounts for the authenticated user")
    public ResponseEntity<List<AccountResponse>> getAllAccounts(
            Authentication authentication,
            @RequestParam(defaultValue = "false") boolean includeArchived
    ) {
        List<AccountResponse> accounts = accountService.getAllAccounts(
                authentication.getName(), includeArchived
        );
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific account by ID")
    public ResponseEntity<AccountResponse> getAccount(
            Authentication authentication,
            @PathVariable Long id
    ) {
        AccountResponse account = accountService.getAccount(authentication.getName(), id);
        return ResponseEntity.ok(account);
    }

    @PostMapping
    @Operation(summary = "Create a new account")
    public ResponseEntity<AccountResponse> createAccount(
            Authentication authentication,
            @Valid @RequestBody AccountRequest request
    ) {
        AccountResponse account = accountService.createAccount(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing account")
    public ResponseEntity<AccountResponse> updateAccount(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest request
    ) {
        AccountResponse account = accountService.updateAccount(authentication.getName(), id, request);
        return ResponseEntity.ok(account);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive an account (soft delete)")
    public ResponseEntity<Void> deleteAccount(
            Authentication authentication,
            @PathVariable Long id
    ) {
        accountService.deleteAccount(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
