package com.financeapp.service;

import com.financeapp.dto.response.CategoryBreakdownResponse;
import com.financeapp.dto.response.MonthlySummaryResponse;
import com.financeapp.dto.response.TopCategoryResponse;
import com.financeapp.entity.User;
import com.financeapp.enums.Currency;
import com.financeapp.enums.Role;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AnalyticsService Unit Tests")
class AnalyticsServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L).email("test@test.com").password("hashed")
                .firstName("John").lastName("Doe")
                .role(Role.ROLE_USER).preferredCurrency(Currency.EUR)
                .createdAt(LocalDateTime.now()).build();
    }

    @Test
    @DisplayName("Should return monthly summary with income, expenses, net")
    void shouldReturnMonthlySummary() {
        Object[] jan = new Object[]{"2026-01", new BigDecimal("3500.00"), new BigDecimal("1200.00")};
        Object[] feb = new Object[]{"2026-02", new BigDecimal("3500.00"), new BigDecimal("1500.00")};

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.getMonthlySummary(eq(1L), any())).thenReturn(List.of(jan, feb));

        List<MonthlySummaryResponse> result = analyticsService.getMonthlySummary("test@test.com", 6);

        assertThat(result).hasSize(2);

        assertThat(result.get(0).getMonth()).isEqualTo("2026-01");
        assertThat(result.get(0).getIncome()).isEqualByComparingTo("3500.00");
        assertThat(result.get(0).getExpenses()).isEqualByComparingTo("1200.00");
        assertThat(result.get(0).getNet()).isEqualByComparingTo("2300.00");

        assertThat(result.get(1).getMonth()).isEqualTo("2026-02");
        assertThat(result.get(1).getNet()).isEqualByComparingTo("2000.00");
    }

    @Test
    @DisplayName("Should return category breakdown with percentages and colors")
    void shouldReturnCategoryBreakdownWithPercentages() {
        Object[] food = new Object[]{1L, "Food", "FOOD", new BigDecimal("300.00")};
        Object[] transport = new Object[]{2L, "Transport", "TRANSPORT", new BigDecimal("200.00")};
        Object[] entertainment = new Object[]{5L, "Entertainment", "ENTERTAINMENT", new BigDecimal("100.00")};

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.getCategoryBreakdown(eq(1L), any(), any()))
                .thenReturn(List.of(food, transport, entertainment));

        List<CategoryBreakdownResponse> result = analyticsService.getCategoryBreakdown("test@test.com", "2026-03");

        assertThat(result).hasSize(3);

        // Food: 300 / 600 = 50%
        assertThat(result.get(0).getCategoryName()).isEqualTo("Food");
        assertThat(result.get(0).getAmount()).isEqualByComparingTo("300.00");
        assertThat(result.get(0).getPercentage()).isEqualTo(50.0);
        assertThat(result.get(0).getColor()).isNotNull();
        assertThat(result.get(0).getCategoryIcon()).isEqualTo("utensils");

        // Transport: 200 / 600 = 33.3%
        assertThat(result.get(1).getCategoryName()).isEqualTo("Transport");
        assertThat(result.get(1).getPercentage()).isEqualTo(33.3);

        // Entertainment: 100 / 600 = 16.7%
        assertThat(result.get(2).getPercentage()).isEqualTo(16.7);

        // All colors should be different
        assertThat(result.get(0).getColor()).isNotEqualTo(result.get(1).getColor());
    }

    @Test
    @DisplayName("Should return top categories ordered by amount with count")
    void shouldReturnTopCategories() {
        Object[] food = new Object[]{1L, "Food", "FOOD", new BigDecimal("450.00"), 12L};
        Object[] housing = new Object[]{3L, "Housing", "HOUSING", new BigDecimal("850.00"), 1L};

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.getTopCategories(eq(1L), any(), any(), eq(5)))
                .thenReturn(List.of(housing, food));

        List<TopCategoryResponse> result = analyticsService.getTopCategories("test@test.com", "2026-03", 5);

        assertThat(result).hasSize(2);

        // Housing should be first (higher amount)
        assertThat(result.get(0).getCategoryName()).isEqualTo("Housing");
        assertThat(result.get(0).getAmount()).isEqualByComparingTo("850.00");
        assertThat(result.get(0).getTransactionCount()).isEqualTo(1);
        assertThat(result.get(0).getCategoryIcon()).isEqualTo("home");

        assertThat(result.get(1).getCategoryName()).isEqualTo("Food");
        assertThat(result.get(1).getTransactionCount()).isEqualTo(12);
    }
}
