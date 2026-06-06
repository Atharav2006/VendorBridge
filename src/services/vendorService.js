import api from './api';

const vendorService = {
  getVendors: async (params = {}) => {
    try {
      const { data } = await api.get('/vendors', { params });
      return data;
    } catch (error) {
      throw error;
    }
  },

  getVendorById: async (id) => {
    try {
      const { data } = await api.get(`/vendors/${id}`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  createVendor: async (vendorData) => {
    try {
      const { data } = await api.post('/vendors', vendorData);
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export default vendorService;
