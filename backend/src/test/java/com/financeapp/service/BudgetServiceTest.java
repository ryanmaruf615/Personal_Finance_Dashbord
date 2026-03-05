package com.financeapp.service;

import com.financeapp.dto.request.BudgetRequest;
import com.financeapp.dto.response.BudgetResponse;
import com.financeapp.dto.response.BudgetStatusResponse;
import com.financeapp.entity.Budget;
import com.financeapp.entity.Category;
import com.financeapp.entity.User;
import com.financeapp.enums.CategoryIcon;
import com.financeapp.enums.Currency;
import com.financeapp.enums.Role;
import com.financeapp.repository.BudgetRepository;
import com.financeapp.repository.CategoryRepository;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BudgetService Unit Tests")
class BudgetServiceTest {

    @Mock private BudgetRepository budgetRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private BudgetService budgetService;

    private User testUser;
    private Category foodCategory;
    private Budget foodBudget;
    private BudgetRequest budgetRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L).email("test@test.com").password("hashed")
                .firstName("John").lastName("Doe")
                .role(Role.ROLE_USER).preferredCurrency(Currency.EUR)
                .createdAt(LocalDateTime.now()).build();

        foodCategory = Category.builder()
                .id(1L).name("Food").icon(CategoryIcon.FOOD)
                .isDefault(true).createdAt(LocalDateTime.now()).build();

        foodBudget = Budget.builder()
                .id(1L).amountLimit(new BigDecimal("400.00"))
                .yearMonth("2026-03").user(testUser).category(foodCategory)
                .createdAt(LocalDateTime.now()).build();

        budgetRequest = BudgetRequest.builder()
                .categoryId(1L).amountLimit(new BigDecimal("400.00"))
                .yearMonth("2026-03").build();
    }

    @Test
    @DisplayName("Should create new budget")
    void shouldCreateBudget() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(categoryRepository.findByIdAndAccessibleByUser(1L, 1L)).thenReturn(Optional.of(foodCategory));
        when(budgetRepository.findByUserIdAndCategoryIdAndYearMonth(1L, 1L, "2026-03"))
                .thenReturn(Optional.empty());
        when(budgetRepository.save(any(Budget.class))).thenReturn(foodBudget);

        BudgetResponse response = budgetService.createOrUpdateBudget("test@test.com", budgetRequest);

        assertThat(response).isNotNull();
        assertThat(response.getCategoryName()).isEqualTo("Food");
        assertThat(response.getAmountLimit()).isEqualByComparingTo("400.00");
        assertThat(response.getYearMonth()).isEqualTo("2026-03");
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    @DisplayName("Should update existing budget for same user+category+month")
    void shouldUpdateExisting() {
        BudgetRequest updateRequest = BudgetRequest.builder()
                .categoryId(1L).amountLimit(new BigDecimal("500.00"))
                .yearMonth("2026-03").build();

        Budget updatedBudget = Budget.builder()
                .id(1L).amountLimit(new BigDecimal("500.00"))
                .yearMonth("2026-03").user(testUser).category(foodCategory)
                .createdAt(LocalDateTime.now()).build();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(categoryRepository.findByIdAndAccessibleByUser(1L, 1L)).thenReturn(Optional.of(foodCategory));
        when(budgetRepository.findByUserIdAndCategoryIdAndYearMonth(1L, 1L, "2026-03"))
                .thenReturn(Optional.of(foodBudget));
        when(budgetRepository.save(any(Budget.class))).thenReturn(updatedBudget);

        BudgetResponse response = budgetService.createOrUpdateBudget("test@test.com", updateRequest);

        assertThat(response.getAmountLimit()).isEqualByComparingTo("500.00");
        verify(budgetRepository).save(foodBudget);
    }

    @Test
    @DisplayName("Should calculate budget status with percentage")
    void shouldCalculateStatus() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(budgetRepository.findByUserIdAndYearMonth(1L, "2026-03"))
                .thenReturn(List.of(foodBudget));
        when(transactionRepository.sumExpenseByUserAndCategoryAndDateRange(
                eq(1L), eq(1L), any(), any()))
                .thenReturn(new BigDecimal("91.00"));

        List<BudgetStatusResponse> statuses = budgetService.getBudgetStatus("test@test.com", "2026-03");

        assertThat(statuses).hasSize(1);
        BudgetStatusResponse status = statuses.get(0);
        assertThat(status.getAmountLimit()).isEqualByComparingTo("400.00");
        assertThat(status.getAmountSpent()).isEqualByComparingTo("91.00");
        assertThat(status.getAmountRemaining()).isEqualByComparingTo("309.00");
        assertThat(status.getPercentage()).isEqualTo(22.8);
        assertThat(status.isOverBudget()).isFalse();
    }

    @Test
    @DisplayName("Should flag over-budget when spent exceeds limit")
    void shouldFlagOverBudget() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(budgetRepository.findByUserIdAndYearMonth(1L, "2026-03"))
                .thenReturn(List.of(foodBudget));
        when(transactionRepository.sumExpenseByUserAndCategoryAndDateRange(
                eq(1L), eq(1L), any(), any()))
                .thenReturn(new BigDecimal("450.00"));

        List<BudgetStatusResponse> statuses = budgetService.getBudgetStatus("test@test.com", "2026-03");

        BudgetStatusResponse status = statuses.get(0);
        assertThat(status.getAmountSpent()).isEqualByComparingTo("450.00");
        assertThat(status.getAmountRemaining()).isEqualByComparingTo("-50.00");
        assertThat(status.getPercentage()).isEqualTo(112.5);
        assertThat(status.isOverBudget()).isTrue();
    }
}
