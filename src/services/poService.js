import api from './api';

const poService = {
  getPurchaseOrders: async () => {
    try {
      const { data } = await api.get('/po');
      return data;
    } catch (error) {
      throw error;
    }
  },

  markAsPaid: async (poId) => {
    try {
      const { data } = await api.put(`/po/${poId}/pay`);
      return data;
    } catch (error) {
      throw error;
    }
  },

  downloadInvoice: async (poId) => {
    try {
      // Trigger a direct download from the browser using standard fetch since Axios download can be tricky with blobs depending on config, but Axios blob works too.
      const response = await api.get(`/po/${poId}/download`, { responseType: 'blob' });
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${poId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  emailInvoice: async (poId) => {
    try {
      const { data } = await api.post(`/po/${poId}/email`);
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export default poService;
