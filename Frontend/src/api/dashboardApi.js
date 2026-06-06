import apiClient from './apiClient';

export const dashboardApi = {
  getSummary: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  }
};
