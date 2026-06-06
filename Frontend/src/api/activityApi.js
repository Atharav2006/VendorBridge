import apiClient from './apiClient';

export const activityApi = {
  getAll: async () => {
    const response = await apiClient.get('/logs');
    return response.data;
  }
};
