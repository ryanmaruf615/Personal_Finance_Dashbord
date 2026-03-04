package com.financeapp.service;

import com.financeapp.dto.request.BudgetRequest;
import com.financeapp.dto.response.BudgetResponse;
import com.financeapp.dto.response.BudgetStatusResponse;
import com.financeapp.entity.Budget;
import com.financeapp.entity.Category;
import com.financeapp.entity.User;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.BudgetRepository;
import com.financeapp.repository.CategoryRepository;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter YM_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    // ─── Get All Budgets for a Month ────────────────────────────────

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(String email, String yearMonth) {
        User user = findUserByEmail(email);

        return budgetRepository.findByUserIdAndYearMonth(user.getId(), yearMonth)
                .stream()
                .map(BudgetResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ─── Create or Update Budget ────────────────────────────────────

    @Transactional
    public BudgetResponse createOrUpdateBudget(String email, BudgetRequest request) {
        User user = findUserByEmail(email);

        Category category = categoryRepository
                .findByIdAndAccessibleByUser(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        // Check if budget already exists for this user + category + month
        Optional<Budget> existing = budgetRepository
                .findByUserIdAndCategoryIdAndYearMonth(user.getId(), category.getId(), request.getYearMonth());

        Budget budget;
        if (existing.isPresent()) {
            // UPDATE existing budget
            budget = existing.get();
            budget.setAmountLimit(request.getAmountLimit());
            log.info("Budget updated: {} {} for user {}", category.getName(), request.getYearMonth(), email);
        } else {
            // CREATE new budget
            budget = Budget.builder()
                    .amountLimit(request.getAmountLimit())
                    .yearMonth(request.getYearMonth())
                    .user(user)
                    .category(category)
                    .build();
            log.info("Budget created: {} {} for user {}", category.getName(), request.getYearMonth(), email);
        }

        Budget saved = budgetRepository.save(budget);
        return BudgetResponse.fromEntity(saved);
    }

    // ─── Delete Budget ──────────────────────────────────────────────

    @Transactional
    public void deleteBudget(String email, Long budgetId) {
        User user = findUserByEmail(email);

        Budget budget = budgetRepository.findByIdAndUserId(budgetId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));

        budgetRepository.delete(budget);
        log.info("Budget deleted: id={} for user {}", budgetId, email);
    }

    // ─── Get Budget Status (spent vs limit) ─────────────────────────

    @Transactional(readOnly = true)
    public List<BudgetStatusResponse> getBudgetStatus(String email, String yearMonth) {
        User user = findUserByEmail(email);

        YearMonth ym = YearMonth.parse(yearMonth, YM_FORMATTER);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Budget> budgets = budgetRepository.findByUserIdAndYearMonth(user.getId(), yearMonth);

        return budgets.stream().map(budget -> {
            BigDecimal amountSpent = transactionRepository.sumExpenseByUserAndCategoryAndDateRange(
                    user.getId(),
                    budget.getCategory().getId(),
                    startDate,
                    endDate
            );

            BigDecimal amountLimit = budget.getAmountLimit();
            BigDecimal amountRemaining = amountLimit.subtract(amountSpent);

            double percentage = 0.0;
            if (amountLimit.compareTo(BigDecimal.ZERO) > 0) {
                percentage = amountSpent
                        .multiply(BigDecimal.valueOf(100))
                        .divide(amountLimit, 1, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            return BudgetStatusResponse.builder()
                    .budgetId(budget.getId())
                    .categoryId(budget.getCategory().getId())
                    .categoryName(budget.getCategory().getName())
                    .categoryIcon(budget.getCategory().getIcon().getIconName())
                    .amountLimit(amountLimit)
                    .amountSpent(amountSpent)
                    .amountRemaining(amountRemaining)
                    .percentage(percentage)
                    .overBudget(amountSpent.compareTo(amountLimit) > 0)
                    .yearMonth(yearMonth)
                    .build();
        }).collect(Collectors.toList());
    }

    // ─── Helper ─────────────────────────────────────────────────────

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
