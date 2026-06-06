import apiClient from './apiClient';

export const purchaseOrderApi = {
  getAll: async () => {
    const response = await apiClient.get('/purchase-orders');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/purchase-orders/${id}/status`, { status });
    return response.data;
  }
};
