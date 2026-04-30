import api from "../api/api";

/**
 * Fetches all alerts for the logged-in donor.
 * @param {Object} params - Optional query params { unread: true, type: 'urgent' }
 */
export const getDonorAlerts = async (params = {}) => {
  try {
    const response = await api.get("donor/alerts/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching donor alerts:", error);
    throw error;
  }
};

/**
 * Marks a single alert as read.
 * @param {number} alertId
 */
export const markAlertRead = async (alertId) => {
  try {
    const response = await api.patch(`donor/alerts/${alertId}/read/`, {
      is_read: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error marking alert as read:", error);
    throw error;
  }
};
