import apiClient from './apiClient';

export const approvalApi = {
  getAll: async () => {
    const response = await apiClient.get('/approvals');
    return response.data;
  },
  updateStatus: async (id, status, comments) => {
    const action = status.toLowerCase(); // 'approved' or 'rejected'
    const response = await apiClient.post(`/approvals/${id}/action`, { action, remarks: comments });
    return response.data;
  },
  requestApproval: async (rfqId, quotationId) => {
    const response = await apiClient.post('/approvals', { rfqId, quotationId });
    return response.data;
  }
};
