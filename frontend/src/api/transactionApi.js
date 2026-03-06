import api from './axiosConfig';

export const transactionApi = {
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.accountId) params.accountId = filters.accountId;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.type) params.type = filters.type;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.search) params.search = filters.search;
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.size) params.size = filters.size;
    if (filters.sort) params.sort = filters.sort;
    return (await api.get('/api/transactions', { params })).data;
  },
  getById: async (id) => (await api.get(`/api/transactions/${id}`)).data,
  create: async (data) => (await api.post('/api/transactions', data)).data,
  update: async (id, data) => (await api.put(`/api/transactions/${id}`, data)).data,
  delete: async (id) => api.delete(`/api/transactions/${id}`),
  previewCsv: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return (await api.post('/api/transactions/import/preview', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
  importCsv: async (file, accountId) => {
    const fd = new FormData();
    fd.append('file', file);
    return (await api.post('/api/transactions/import/confirm', fd, {
      params: { accountId },
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
};
