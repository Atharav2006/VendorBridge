import axiosInstance, { API_BASE_URL } from '../api/axiosConfig';

// Explicit API Variables requested by USER
export const GET_APPROVAL_DETAILS_API = `${API_BASE_URL}/approvals`;
export const APPROVE_RFQ_API = (id) => `${API_BASE_URL}/approvals/${id}/approve`;
export const REJECT_RFQ_API = (id) => `${API_BASE_URL}/approvals/${id}/reject`;

export const approvalService = {
  getApprovals: async (status = '') => {
    // Queries all or filters by workflow status
    const url = status ? `${GET_APPROVAL_DETAILS_API}?status=${status}` : GET_APPROVAL_DETAILS_API;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getApprovalById: async (id) => {
    const response = await axiosInstance.get(`${GET_APPROVAL_DETAILS_API}/${id}`);
    return response.data;
  },

  approveRFQ: async (id, remarks) => {
    const response = await axiosInstance.post(APPROVE_RFQ_API(id), { remarks });
    return response.data;
  },

  rejectRFQ: async (id, remarks) => {
    const response = await axiosInstance.post(REJECT_RFQ_API(id), { remarks });
    return response.data;
  },
};

export default approvalService;
