import api from './api';

const quotationService = {
  submitQuotation: async (quotationData) => {
    try {
      const { data } = await api.post('/quotations', quotationData);
      return data;
    } catch (error) {
      throw error;
    }
  },

  saveQuotationDraft: async (quotationData) => {
    try {
      const { data } = await api.post('/quotations', { ...quotationData, status: 'Draft' });
      return data;
    } catch (error) {
      throw error;
    }
  },

  getQuotationComparison: async (rfqId) => {
    try {
      const { data } = await api.get(`/quotations/compare/${rfqId}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  getRFQDetails: async (rfqId) => {
    try {
      const { data } = await api.get(`/rfq/${rfqId}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  selectVendor: async (quotationId) => {
    // Mock for now or implement in backend if requested
    return { success: true };
  },

  initiateApprovalWorkflow: async (rfqId, quotationId) => {
    // Mock for now or implement in backend if requested
    return { success: true };
  }
};

export default quotationService;
