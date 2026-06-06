import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on load
    const savedToken = localStorage.getItem('vb_token');
    const savedUser = localStorage.getItem('vb_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const mapBackendRoleToFrontend = (role) => {
    switch(role) {
      case 'admin': return 'Admin';
      case 'procurement_officer': return 'Procurement Officer';
      case 'manager': return 'Manager';
      case 'vendor': return 'Vendor';
      default: return role;
    }
  };

  const mapFrontendRoleToBackend = (role) => {
    switch(role) {
      case 'Admin': return 'admin';
      case 'Procurement Officer': return 'procurement_officer';
      case 'Manager': return 'manager';
      case 'Vendor': return 'vendor';
      default: return role;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      
      // Map backend role to frontend expected string
      if (response.user) {
        response.user.role = mapBackendRoleToFrontend(response.user.role);
      }

      localStorage.setItem('vb_token', response.token);
      localStorage.setItem('vb_user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      // Map frontend role string to backend enum
      const backendRole = mapFrontendRoleToBackend(role);
      
      const response = await authApi.signup({ name, email, password, role: backendRole });
      
      // Map back to frontend expected string
      if (response.user) {
        response.user.role = mapBackendRoleToFrontend(response.user.role);
      }

      localStorage.setItem('vb_token', response.token);
      localStorage.setItem('vb_user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = (updatedUserFields) => {
    const newUser = { ...user, ...updatedUserFields };
    localStorage.setItem('vb_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
