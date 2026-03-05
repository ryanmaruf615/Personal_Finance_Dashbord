// ─── Enums ──────────────────────────────────────────────────────────

export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'PLN';

// ─── Requests ───────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  preferredCurrency?: Currency;
}

// ─── Responses ──────────────────────────────────────────────────────

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  preferredCurrency: Currency;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

// ─── Error ──────────────────────────────────────────────────────────

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}
