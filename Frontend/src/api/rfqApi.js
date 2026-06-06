import apiClient from './apiClient';

export const rfqApi = {
  getAll: async () => {
    const response = await apiClient.get('/rfqs');
    return response.data;
  },
  create: async (rfqData) => {
    const response = await apiClient.post('/rfqs', rfqData);
    return response.data;
  }
};
