import { Currency } from './auth';

// ─── Enums ──────────────────────────────────────────────────────────

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH' | 'CREDIT_CARD';

// ─── Requests ───────────────────────────────────────────────────────

export interface AccountRequest {
  name: string;
  type: AccountType;
  currency?: Currency;
}

// ─── Responses ──────────────────────────────────────────────────────

export interface AccountResponse {
  id: number;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  isArchived: boolean;
  createdAt: string;
}
