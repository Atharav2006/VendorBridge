import apiClient from './apiClient';

export const vendorApi = {
  getAll: async () => {
    const response = await apiClient.get('/vendors');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/vendors/${id}`);
    return response.data;
  },
  create: async (vendorData) => {
    const response = await apiClient.post('/vendors', vendorData);
    return response.data;
  },
  update: async (id, vendorData) => {
    const response = await apiClient.put(`/vendors/${id}`, vendorData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/vendors/${id}`);
    return response.data;
  }
};
