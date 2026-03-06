import api from './axiosConfig';

export const analyticsApi = {
  getMonthlySummary: async (months = 6) =>
    (await api.get('/api/analytics/monthly-summary', { params: { months } })).data,
  getCategoryBreakdown: async (yearMonth) =>
    (await api.get('/api/analytics/category-breakdown', { params: { yearMonth } })).data,
  getDailySpending: async (yearMonth) =>
    (await api.get('/api/analytics/daily-spending', { params: { yearMonth } })).data,
  getTopCategories: async (yearMonth, limit = 5) =>
    (await api.get('/api/analytics/top-categories', { params: { yearMonth, limit } })).data,
  getMonthComparison: async (month1, month2) =>
    (await api.get('/api/analytics/comparison', { params: { month1, month2 } })).data,
};

export const adminApi = {
  getStats: async () => (await api.get('/api/admin/stats')).data,
  getUsers: async () => (await api.get('/api/admin/users')).data,
};
