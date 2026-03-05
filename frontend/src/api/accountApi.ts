import api from './axiosConfig';
import { AccountRequest, AccountResponse } from '../types/account';

export const accountApi = {
  getAll: async (includeArchived = false): Promise<AccountResponse[]> => {
    const response = await api.get<AccountResponse[]>('/api/accounts', {
      params: { includeArchived },
    });
    return response.data;
  },

  getById: async (id: number): Promise<AccountResponse> => {
    const response = await api.get<AccountResponse>(`/api/accounts/${id}`);
    return response.data;
  },

  create: async (data: AccountRequest): Promise<AccountResponse> => {
    const response = await api.post<AccountResponse>('/api/accounts', data);
    return response.data;
  },

  update: async (id: number, data: AccountRequest): Promise<AccountResponse> => {
    const response = await api.put<AccountResponse>(`/api/accounts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/accounts/${id}`);
  },
};
