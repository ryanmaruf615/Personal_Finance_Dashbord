// ─── Responses ──────────────────────────────────────────────────────

export interface MonthlySummaryResponse {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdownResponse {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DailySpendingResponse {
  date: string;
  amount: number;
}

export interface TopCategoryResponse {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  transactionCount: number;
}

export interface MonthComparisonResponse {
  month1: MonthlySummaryResponse;
  month2: MonthlySummaryResponse;
  incomeChange: number;
  expenseChange: number;
  netChange: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
}

// ─── Admin ──────────────────────────────────────────────────────────

export interface AdminStatsResponse {
  totalUsers: number;
  totalTransactions: number;
  totalAccounts: number;
  totalBudgets: number;
  totalIncomeAllUsers: number;
  totalExpensesAllUsers: number;
}
