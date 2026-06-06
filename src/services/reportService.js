import axiosInstance, { API_BASE_URL } from '../api/axiosConfig';

// Explicit API Variables requested by USER
export const GET_REPORT_ANALYTICS_API = `${API_BASE_URL}/reports/analytics`;
export const EXPORT_REPORT_API = `${API_BASE_URL}/reports/export`;

export const reportService = {
  getAnalytics: async () => {
    const response = await axiosInstance.get(GET_REPORT_ANALYTICS_API);
    return response.data;
  },

  exportReport: async (format, type) => {
    const response = await axiosInstance.post(EXPORT_REPORT_API, { format, type }, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `procurement_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return { success: true };
  },
};

export default reportService;
