import { Currency } from './auth';

// ─── Enums ──────────────────────────────────────────────────────────

export type TransactionType = 'INCOME' | 'EXPENSE';

// ─── Requests ───────────────────────────────────────────────────────

export interface TransactionRequest {
  amount: number;
  type: TransactionType;
  description?: string;
  transactionDate: string;
  accountId: number;
  categoryId: number;
}

export interface TransactionFilters {
  accountId?: number;
  categoryId?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ─── Responses ──────────────────────────────────────────────────────

export interface TransactionResponse {
  id: number;
  amount: number;
  convertedAmount: number;
  currency: Currency;
  type: TransactionType;
  description: string | null;
  transactionDate: string;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ─── CSV Import ─────────────────────────────────────────────────────

export interface CsvRowPreview {
  rowNumber: number;
  date: string;
  description: string;
  amount: string;
  type: string;
  category: string;
  valid: boolean;
  duplicate: boolean;
  errorMessage: string | null;
}

export interface CsvPreviewResponse {
  rows: CsvRowPreview[];
  totalRows: number;
  validRows: number;
  errorRows: number;
  duplicateRows: number;
}

export interface CsvImportResultResponse {
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
}
