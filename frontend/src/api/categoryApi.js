import api from './axiosConfig';

export const categoryApi = {
  getAll: async () => (await api.get('/api/categories')).data,
  getById: async (id) => (await api.get(`/api/categories/${id}`)).data,
  create: async (data) => (await api.post('/api/categories', data)).data,
  update: async (id, data) => (await api.put(`/api/categories/${id}`, data)).data,
  delete: async (id) => api.delete(`/api/categories/${id}`),
};
