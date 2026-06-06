import apiClient from './apiClient';

export const authApi = {
  login: async (credentials) => {
    // Post credentials to mock router
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  }
};
