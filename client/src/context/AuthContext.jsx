import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth.js';
import { clearTokens, getAccessToken, setAuthFailureHandler } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAuthFailure = useCallback(() => {
    setUser(null);
    clearTokens();
  }, []);

  useEffect(() => {
    setAuthFailureHandler(handleAuthFailure);
    const token = getAccessToken();
    if (token) {
      authApi
        .getMe()
        .then(setUser)
        .catch(handleAuthFailure)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [handleAuthFailure]);

  const login = async (data) => {
    const result = await authApi.login(data);
    setUser(result.user);
    return result;
  };

  const register = async (data) => {
    const result = await authApi.register(data);
    setUser(result.user);
    return result;
  };

  const logout = async () => {
    await authApi.logout();
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
