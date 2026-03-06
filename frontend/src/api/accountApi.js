import api from './axiosConfig';

export const accountApi = {
  getAll: async (includeArchived = false) =>
    (await api.get('/api/accounts', { params: { includeArchived } })).data,
  getById: async (id) => (await api.get(`/api/accounts/${id}`)).data,
  create: async (data) => (await api.post('/api/accounts', data)).data,
  update: async (id, data) => (await api.put(`/api/accounts/${id}`, data)).data,
  delete: async (id) => api.delete(`/api/accounts/${id}`),
};
