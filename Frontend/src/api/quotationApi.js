import apiClient from './apiClient';

export const quotationApi = {
  getAll: async () => {
    const response = await apiClient.get('/quotations');
    return response.data;
  },
  create: async (quotationData) => {
    const response = await apiClient.post(`/rfqs/${quotationData.rfqId}/quotations`, quotationData);
    return response.data;
  }
};
