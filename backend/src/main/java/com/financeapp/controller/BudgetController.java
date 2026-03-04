package com.financeapp.controller;

import com.financeapp.dto.request.BudgetRequest;
import com.financeapp.dto.response.BudgetResponse;
import com.financeapp.dto.response.BudgetStatusResponse;
import com.financeapp.service.BudgetService;
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
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Manage monthly spending budgets per category")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Get all budgets for a specific month")
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            Authentication authentication,
            @RequestParam String yearMonth
    ) {
        List<BudgetResponse> budgets = budgetService.getBudgets(authentication.getName(), yearMonth);
        return ResponseEntity.ok(budgets);
    }

    @PostMapping
    @Operation(summary = "Create or update a budget (upsert by user + category + month)")
    public ResponseEntity<BudgetResponse> createOrUpdateBudget(
            Authentication authentication,
            @Valid @RequestBody BudgetRequest request
    ) {
        BudgetResponse budget = budgetService.createOrUpdateBudget(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(budget);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a budget")
    public ResponseEntity<Void> deleteBudget(
            Authentication authentication,
            @PathVariable Long id
    ) {
        budgetService.deleteBudget(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    @Operation(summary = "Get budget status with spent amounts, percentages, and over-budget flags")
    public ResponseEntity<List<BudgetStatusResponse>> getBudgetStatus(
            Authentication authentication,
            @RequestParam String yearMonth
    ) {
        List<BudgetStatusResponse> status = budgetService.getBudgetStatus(authentication.getName(), yearMonth);
        return ResponseEntity.ok(status);
    }
}
