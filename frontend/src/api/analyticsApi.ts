import api from './axiosConfig';
import {
  MonthlySummaryResponse,
  CategoryBreakdownResponse,
  DailySpendingResponse,
  TopCategoryResponse,
  MonthComparisonResponse,
  AdminStatsResponse,
} from '../types/analytics';
import { UserResponse } from '../types/auth';

export const analyticsApi = {
  getMonthlySummary: async (months = 6): Promise<MonthlySummaryResponse[]> => {
    const response = await api.get<MonthlySummaryResponse[]>(
      '/api/analytics/monthly-summary',
      { params: { months } }
    );
    return response.data;
  },

  getCategoryBreakdown: async (
    yearMonth: string
  ): Promise<CategoryBreakdownResponse[]> => {
    const response = await api.get<CategoryBreakdownResponse[]>(
      '/api/analytics/category-breakdown',
      { params: { yearMonth } }
    );
    return response.data;
  },

  getDailySpending: async (
    yearMonth: string
  ): Promise<DailySpendingResponse[]> => {
    const response = await api.get<DailySpendingResponse[]>(
      '/api/analytics/daily-spending',
      { params: { yearMonth } }
    );
    return response.data;
  },

  getTopCategories: async (
    yearMonth: string,
    limit = 5
  ): Promise<TopCategoryResponse[]> => {
    const response = await api.get<TopCategoryResponse[]>(
      '/api/analytics/top-categories',
      { params: { yearMonth, limit } }
    );
    return response.data;
  },

  getMonthComparison: async (
    month1: string,
    month2: string
  ): Promise<MonthComparisonResponse> => {
    const response = await api.get<MonthComparisonResponse>(
      '/api/analytics/comparison',
      { params: { month1, month2 } }
    );
    return response.data;
  },
};

// ─── Admin API ──────────────────────────────────────────────────────

export const adminApi = {
  getStats: async (): Promise<AdminStatsResponse> => {
    const response = await api.get<AdminStatsResponse>('/api/admin/stats');
    return response.data;
  },

  getUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/api/admin/users');
    return response.data;
  },
};
