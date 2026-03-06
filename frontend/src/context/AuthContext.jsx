import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { getAccessToken, clearTokens } from '../api/axiosConfig';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();
      if (!token) { setIsLoading(false); return; }

      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const freshUser = await authApi.getMe();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (data) => {
    const response = await authApi.login(data);
    setUser(response.user);
    toast.success(`Welcome back, ${response.user.firstName}!`);
  }, []);

  const register = useCallback(async (data) => {
    const response = await authApi.register(data);
    setUser(response.user);
    toast.success('Account created successfully!');
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    toast.success('Logged out');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
