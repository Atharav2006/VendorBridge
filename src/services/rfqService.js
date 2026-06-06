import api from './api';
import vendorService from './vendorService'; // Reuse logic if needed

const rfqService = {
  getRFQs: async () => {
    try {
      const { data } = await api.get('/rfq');
      return data;
    } catch (error) {
      throw error;
    }
  },

  createRFQ: async (rfqData) => {
    try {
      const { data } = await api.post('/rfq', rfqData);
      return data;
    } catch (error) {
      throw error;
    }
  },

  saveRFQDraft: async (rfqData) => {
    try {
      // In a real app this might be a PUT or POST depending on existence.
      // For now we'll just mock it or treat it as a create
      const { data } = await api.post('/rfq', { ...rfqData, status: 'Draft' });
      return data;
    } catch (error) {
      throw error;
    }
  },

  getVendorList: async () => {
    return await vendorService.getVendors();
  }
};

export default rfqService;
