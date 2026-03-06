import api, { setTokens, clearTokens } from './axiosConfig';

export const authApi = {
  register: async (data) => {
    const res = await api.post('/api/auth/register', data);
    setTokens(res.data.access_token, res.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },
  login: async (data) => {
    const res = await api.post('/api/auth/login', data);
    setTokens(res.data.access_token, res.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },
  refresh: async (data) => {
    const res = await api.post('/api/auth/refresh', data);
    setTokens(res.data.access_token, res.data.refresh_token);
    return res.data;
  },
  getMe: async () => (await api.get('/api/auth/me')).data,
  updateProfile: async (data) => {
    const res = await api.put('/api/auth/me', data);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  },
  logout: () => { clearTokens(); window.location.href = '/login'; },
};
