import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

// Demo users matching the seeded backend data — used when backend is offline
const DEMO_USERS = {
  admin: {
    _id: 'demo-admin-001',
    username: 'admin',
    email: 'admin@vendorbridge.com',
    role: 'Admin',
    isDemo: true,
  },
  manager: {
    _id: 'demo-manager-001',
    username: 'manager',
    email: 'manager@vendorbridge.com',
    role: 'Manager',
    isDemo: true,
  },
  buyer: {
    _id: 'demo-purchaser-001',
    username: 'buyer',
    email: 'buyer@vendorbridge.com',
    role: 'Purchaser',
    isDemo: true,
  },
  vendor_steel: {
    _id: 'demo-vendor-001',
    username: 'vendor_steel',
    email: 'sales@steelmetals.com',
    role: 'Vendor',
    isDemo: true,
  },
};

// Lightweight fake JWT for demo sessions (not cryptographically secure — demo only)
const createDemoToken = (username) => {
  const payload = btoa(JSON.stringify({ id: `demo-${username}`, demo: true }));
  return `demo.${payload}.signature`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync token changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  // Load profile on initial render if token is present
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        // Check if this is a demo token — skip API call
        if (token.startsWith('demo.')) {
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          } else {
            logout();
          }
          setLoading(false);
          return;
        }

        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data || res);
            localStorage.setItem('user', JSON.stringify(res.data || res));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to initialize user session:', err.message);
          // Server offline — fall back to cached user
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Real login — hits backend API
  const login = async (emailOrUsername, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(emailOrUsername, password);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res);
        localStorage.setItem('user', JSON.stringify(res));
        setLoading(false);
        return { success: true };
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      setLoading(false);
      return { success: false, error: errMsg };
    }
  };

  // Demo login — now routes through the real backend API using the seeded credentials
  const loginDemo = async (username) => {
    setError(null);
    let email = '';
    const pwd = 'password123'; // all seeded users share this password
    
    switch(username) {
      case 'admin': email = 'admin@vendorbridge.com'; break;
      case 'manager': email = 'manager@vendorbridge.com'; break;
      case 'buyer': email = 'purchaser@vendorbridge.com'; break;
      case 'vendor_steel': email = 'sales@steelmetals.com'; break;
      default: email = 'admin@vendorbridge.com';
    }

    return await login(email, pwd);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    loginDemo,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
