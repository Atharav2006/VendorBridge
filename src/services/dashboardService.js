import axiosInstance, { API_BASE_URL } from '../api/axiosConfig';

// ─── API Route Constants ──────────────────────────────────────────────────────
export const GET_DASHBOARD_ANALYTICS_API = `${API_BASE_URL}/dashboard/analytics`;
export const GET_RECENT_PURCHASE_ORDERS_API = `${API_BASE_URL}/dashboard/recent-purchase-orders`;

// ─── Dashboard Service ────────────────────────────────────────────────────────
export const dashboardService = {
  /**
   * Fetches overview analytics cards (active RFQs, pending approvals,
   * procurement spend, overdue invoices, and spending trends).
   * @returns {Promise<Object>} dashboardSummary + analyticsCards + spendingAnalytics
   */
  getDashboardAnalytics: async () => {
    // API INTEGRATION POINT: GET /api/dashboard/analytics
    const response = await axiosInstance.get(GET_DASHBOARD_ANALYTICS_API);
    return response.data;
  },

  /**
   * Fetches a paginated list of recent purchase orders for the dashboard table.
   * @param {number} limit - Number of rows to fetch (default 10)
   * @returns {Promise<Object>} { success, data: recentPurchaseOrders[] }
   */
  getRecentPurchaseOrders: async (limit = 10) => {
    // API INTEGRATION POINT: GET /api/dashboard/recent-purchase-orders?limit=10
    const response = await axiosInstance.get(GET_RECENT_PURCHASE_ORDERS_API, {
      params: { limit },
    });
    return response.data;
  },
};

export default dashboardService;
