package com.financeapp.controller;

import com.financeapp.dto.response.*;
import com.financeapp.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Dashboard analytics and reporting")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/monthly-summary")
    @Operation(summary = "Get income/expense/net summary for the last N months")
    public ResponseEntity<List<MonthlySummaryResponse>> getMonthlySummary(
            Authentication authentication,
            @RequestParam(defaultValue = "6") int months
    ) {
        List<MonthlySummaryResponse> summary = analyticsService.getMonthlySummary(
                authentication.getName(), months
        );
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/category-breakdown")
    @Operation(summary = "Get expense breakdown by category for a month (pie chart data)")
    public ResponseEntity<List<CategoryBreakdownResponse>> getCategoryBreakdown(
            Authentication authentication,
            @RequestParam String yearMonth
    ) {
        List<CategoryBreakdownResponse> breakdown = analyticsService.getCategoryBreakdown(
                authentication.getName(), yearMonth
        );
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/daily-spending")
    @Operation(summary = "Get daily expense totals for a month (line chart data)")
    public ResponseEntity<List<DailySpendingResponse>> getDailySpending(
            Authentication authentication,
            @RequestParam String yearMonth
    ) {
        List<DailySpendingResponse> dailySpending = analyticsService.getDailySpending(
                authentication.getName(), yearMonth
        );
        return ResponseEntity.ok(dailySpending);
    }

    @GetMapping("/top-categories")
    @Operation(summary = "Get top spending categories for a month")
    public ResponseEntity<List<TopCategoryResponse>> getTopCategories(
            Authentication authentication,
            @RequestParam String yearMonth,
            @RequestParam(defaultValue = "5") int limit
    ) {
        List<TopCategoryResponse> topCategories = analyticsService.getTopCategories(
                authentication.getName(), yearMonth, limit
        );
        return ResponseEntity.ok(topCategories);
    }

    @GetMapping("/comparison")
    @Operation(summary = "Compare income/expense between two months")
    public ResponseEntity<MonthComparisonResponse> getMonthComparison(
            Authentication authentication,
            @RequestParam String month1,
            @RequestParam String month2
    ) {
        MonthComparisonResponse comparison = analyticsService.getMonthComparison(
                authentication.getName(), month1, month2
        );
        return ResponseEntity.ok(comparison);
    }
}
