import api from './api';

const auditService = {
  getLogs: async (params) => {
    try {
      const { data } = await api.get('/audit', { params });
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export default auditService;
