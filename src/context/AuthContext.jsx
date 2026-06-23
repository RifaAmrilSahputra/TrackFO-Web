import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/apiClient';
import { logError } from '../utils/errorHandler';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // Initialize auth state dari localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (err) {
        logError(err, 'AuthProvider initialization');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data.data;
      
      // Simpan ke localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      logError(err, 'Login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call logout endpoint jika diperlukan
      try {
        await authAPI.logout();
      } catch (err) {
        // Ignore error dari endpoint logout
        console.warn('Logout endpoint error:', err);
      }
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      logError(err, 'Logout');
      // Tetap clear state meski ada error
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function untuk check role
  const hasRole = useCallback((role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }, [user]);

  // Helper function untuk check jika super admin
  const isSuperAdmin = useCallback(() => {
    return hasRole('SUPER_ADMIN');
  }, [hasRole]);

  // Helper function untuk check jika admin
  const isAdmin = useCallback(() => {
    return hasRole('ADMIN');
  }, [hasRole]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError,
    hasRole,
    isSuperAdmin,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  return context;
};
