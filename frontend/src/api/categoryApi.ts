import api from './axiosConfig';
import { CategoryRequest, CategoryResponse } from '../types/category';

export const categoryApi = {
  getAll: async (): Promise<CategoryResponse[]> => {
    const response = await api.get<CategoryResponse[]>('/api/categories');
    return response.data;
  },

  getById: async (id: number): Promise<CategoryResponse> => {
    const response = await api.get<CategoryResponse>(`/api/categories/${id}`);
    return response.data;
  },

  create: async (data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await api.post<CategoryResponse>('/api/categories', data);
    return response.data;
  },

  update: async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await api.put<CategoryResponse>(`/api/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
  },
};
