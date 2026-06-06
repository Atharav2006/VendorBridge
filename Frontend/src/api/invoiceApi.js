import apiClient from './apiClient';

export const invoiceApi = {
  getAll: async () => {
    const response = await apiClient.get('/invoices');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },
  downloadPdf: async (id) => {
    const response = await apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },
  emailInvoice: async (id) => {
    const response = await apiClient.post(`/invoices/${id}/email`);
    return response.data;
  }
};
