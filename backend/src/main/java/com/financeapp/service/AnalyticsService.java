package com.financeapp.service;

import com.financeapp.dto.response.*;
import com.financeapp.entity.User;
import com.financeapp.enums.CategoryIcon;
import com.financeapp.exception.ResourceNotFoundException;
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
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter YM_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    // Color palette for pie chart categories
    private static final String[] CHART_COLORS = {
            "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
            "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
            "#14B8A6", "#E11D48"
    };

    // ─── Monthly Summary (last N months) ────────────────────────────

    @Transactional(readOnly = true)
    public List<MonthlySummaryResponse> getMonthlySummary(String email, int months) {
        User user = findUserByEmail(email);
        LocalDate startDate = YearMonth.now().minusMonths(months - 1).atDay(1);

        List<Object[]> results = transactionRepository.getMonthlySummary(user.getId(), startDate);

        List<MonthlySummaryResponse> summaries = new ArrayList<>();
        for (Object[] row : results) {
            String month = (String) row[0];
            BigDecimal income = toBigDecimal(row[1]);
            BigDecimal expenses = toBigDecimal(row[2]);

            summaries.add(MonthlySummaryResponse.builder()
                    .month(month)
                    .income(income)
                    .expenses(expenses)
                    .net(income.subtract(expenses))
                    .build());
        }

        return summaries;
    }

    // ─── Category Breakdown (pie chart) ─────────────────────────────

    @Transactional(readOnly = true)
    public List<CategoryBreakdownResponse> getCategoryBreakdown(String email, String yearMonth) {
        User user = findUserByEmail(email);
        YearMonth ym = YearMonth.parse(yearMonth, YM_FORMATTER);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Object[]> results = transactionRepository.getCategoryBreakdown(
                user.getId(), startDate, endDate
        );

        // Calculate total for percentage
        BigDecimal total = BigDecimal.ZERO;
        for (Object[] row : results) {
            total = total.add(toBigDecimal(row[3]));
        }

        List<CategoryBreakdownResponse> breakdown = new ArrayList<>();
        for (int i = 0; i < results.size(); i++) {
            Object[] row = results.get(i);
            BigDecimal amount = toBigDecimal(row[3]);

            double percentage = 0.0;
            if (total.compareTo(BigDecimal.ZERO) > 0) {
                percentage = amount.multiply(BigDecimal.valueOf(100))
                        .divide(total, 1, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            String iconEnum = (String) row[2];
            String iconName;
            try {
                iconName = CategoryIcon.valueOf(iconEnum).getIconName();
            } catch (IllegalArgumentException e) {
                iconName = "circle-dot";
            }

            breakdown.add(CategoryBreakdownResponse.builder()
                    .categoryId(toLong(row[0]))
                    .categoryName((String) row[1])
                    .categoryIcon(iconName)
                    .amount(amount)
                    .percentage(percentage)
                    .color(CHART_COLORS[i % CHART_COLORS.length])
                    .build());
        }

        return breakdown;
    }

    // ─── Daily Spending (line chart) ────────────────────────────────

    @Transactional(readOnly = true)
    public List<DailySpendingResponse> getDailySpending(String email, String yearMonth) {
        User user = findUserByEmail(email);
        YearMonth ym = YearMonth.parse(yearMonth, YM_FORMATTER);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Object[]> results = transactionRepository.getDailySpending(
                user.getId(), startDate, endDate
        );

        List<DailySpendingResponse> dailySpending = new ArrayList<>();
        for (Object[] row : results) {
            LocalDate date;
            if (row[0] instanceof java.sql.Date) {
                date = ((java.sql.Date) row[0]).toLocalDate();
            } else {
                date = (LocalDate) row[0];
            }

            dailySpending.add(DailySpendingResponse.builder()
                    .date(date)
                    .amount(toBigDecimal(row[1]))
                    .build());
        }

        return dailySpending;
    }

    // ─── Top Categories ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TopCategoryResponse> getTopCategories(String email, String yearMonth, int limit) {
        User user = findUserByEmail(email);
        YearMonth ym = YearMonth.parse(yearMonth, YM_FORMATTER);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Object[]> results = transactionRepository.getTopCategories(
                user.getId(), startDate, endDate, limit
        );

        List<TopCategoryResponse> topCategories = new ArrayList<>();
        for (Object[] row : results) {
            String iconEnum = (String) row[2];
            String iconName;
            try {
                iconName = CategoryIcon.valueOf(iconEnum).getIconName();
            } catch (IllegalArgumentException e) {
                iconName = "circle-dot";
            }

            topCategories.add(TopCategoryResponse.builder()
                    .categoryId(toLong(row[0]))
                    .categoryName((String) row[1])
                    .categoryIcon(iconName)
                    .amount(toBigDecimal(row[3]))
                    .transactionCount(toLong(row[4]))
                    .build());
        }

        return topCategories;
    }

    // ─── Month Comparison ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public MonthComparisonResponse getMonthComparison(String email, String month1Str, String month2Str) {
        User user = findUserByEmail(email);

        MonthlySummaryResponse m1 = getMonthSummary(user.getId(), month1Str);
        MonthlySummaryResponse m2 = getMonthSummary(user.getId(), month2Str);

        BigDecimal incomeChange = m2.getIncome().subtract(m1.getIncome());
        BigDecimal expenseChange = m2.getExpenses().subtract(m1.getExpenses());
        BigDecimal netChange = m2.getNet().subtract(m1.getNet());

        double incomeChangePct = calcChangePercent(m1.getIncome(), m2.getIncome());
        double expenseChangePct = calcChangePercent(m1.getExpenses(), m2.getExpenses());

        return MonthComparisonResponse.builder()
                .month1(m1)
                .month2(m2)
                .incomeChange(incomeChange)
                .expenseChange(expenseChange)
                .netChange(netChange)
                .incomeChangePercent(incomeChangePct)
                .expenseChangePercent(expenseChangePct)
                .build();
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private MonthlySummaryResponse getMonthSummary(Long userId, String yearMonth) {
        YearMonth ym = YearMonth.parse(yearMonth, YM_FORMATTER);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        Object[] result = transactionRepository.getMonthTotals(userId, startDate, endDate);

        BigDecimal income = toBigDecimal(result[0]);
        BigDecimal expenses = toBigDecimal(result[1]);

        return MonthlySummaryResponse.builder()
                .month(yearMonth)
                .income(income)
                .expenses(expenses)
                .net(income.subtract(expenses))
                .build();
    }

    private double calcChangePercent(BigDecimal oldVal, BigDecimal newVal) {
        if (oldVal.compareTo(BigDecimal.ZERO) == 0) {
            return newVal.compareTo(BigDecimal.ZERO) == 0 ? 0.0 : 100.0;
        }
        return newVal.subtract(oldVal)
                .multiply(BigDecimal.valueOf(100))
                .divide(oldVal, 1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        return new BigDecimal(value.toString());
    }

    private long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number) return ((Number) value).longValue();
        return Long.parseLong(value.toString());
    }
}
