import api, { setTokens, clearTokens } from './axiosConfig';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  UpdateProfileRequest,
  UserResponse,
} from '../types/auth';

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    setTokens(response.data.access_token, response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    setTokens(response.data.access_token, response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/refresh', data);
    setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },

  getMe: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    const response = await api.put<UserResponse>('/api/auth/me', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  logout: (): void => {
    clearTokens();
    window.location.href = '/login';
  },
};
