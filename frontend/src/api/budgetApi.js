import api from './axiosConfig';

export const budgetApi = {
  getAll: async (yearMonth) => (await api.get('/api/budgets', { params: { yearMonth } })).data,
  createOrUpdate: async (data) => (await api.post('/api/budgets', data)).data,
  delete: async (id) => api.delete(`/api/budgets/${id}`),
  getStatus: async (yearMonth) => (await api.get('/api/budgets/status', { params: { yearMonth } })).data,
};
