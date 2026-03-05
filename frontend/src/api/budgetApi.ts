import api from './axiosConfig';
import {
  BudgetRequest,
  BudgetResponse,
  BudgetStatusResponse,
} from '../types/budget';

export const budgetApi = {
  getAll: async (yearMonth: string): Promise<BudgetResponse[]> => {
    const response = await api.get<BudgetResponse[]>('/api/budgets', {
      params: { yearMonth },
    });
    return response.data;
  },

  createOrUpdate: async (data: BudgetRequest): Promise<BudgetResponse> => {
    const response = await api.post<BudgetResponse>('/api/budgets', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/budgets/${id}`);
  },

  getStatus: async (yearMonth: string): Promise<BudgetStatusResponse[]> => {
    const response = await api.get<BudgetStatusResponse[]>(
      '/api/budgets/status',
      { params: { yearMonth } }
    );
    return response.data;
  },
};
