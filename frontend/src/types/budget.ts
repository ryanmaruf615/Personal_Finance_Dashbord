// ─── Requests ───────────────────────────────────────────────────────

export interface BudgetRequest {
  categoryId: number;
  amountLimit: number;
  yearMonth: string;
}

// ─── Responses ──────────────────────────────────────────────────────

export interface BudgetResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amountLimit: number;
  yearMonth: string;
  createdAt: string;
}

export interface BudgetStatusResponse {
  budgetId: number;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amountLimit: number;
  amountSpent: number;
  amountRemaining: number;
  percentage: number;
  overBudget: boolean;
  yearMonth: string;
}
