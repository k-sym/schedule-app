import apiClient from './client';

/**
 * Get availability with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.entertainerId - Optional entertainer ID
 * @param {string} params.startDate - Optional start date (YYYY-MM-DD)
 * @param {string} params.endDate - Optional end date (YYYY-MM-DD)
 */
export const getAvailability = async (params = {}) => {
  const response = await apiClient.get('/availability', { params });
  return response.data;
};

/**
 * Get current user's availability
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Optional start date
 * @param {string} params.endDate - Optional end date
 */
export const getMyAvailability = async (params = {}) => {
  console.log('[API] getMyAvailability called with params:', params);
  console.trace('[API] Call stack for getMyAvailability');
  const response = await apiClient.get('/availability/me', { params });
  return response.data;
};

/**
 * Get availability for a specific month
 * @param {number} year
 * @param {number} month - 1-12
 */
export const getAvailabilityForMonth = async (year, month) => {
  const response = await apiClient.get(`/availability/month/${year}/${month}`);
  return response.data;
};

/**
 * Create a single availability entry
 * @param {Object} data
 * @param {string} data.availableDate - Date in YYYY-MM-DD format
 * @param {string} data.notes - Optional notes
 */
export const createAvailability = async (data) => {
  const response = await apiClient.post('/availability', data);
  return response.data;
};

/**
 * Bulk create availability entries
 * @param {Object} data
 * @param {Array<string>} data.dates - Array of dates in YYYY-MM-DD format
 * @param {string} data.notes - Optional notes
 */
export const bulkCreateAvailability = async (data) => {
  const response = await apiClient.post('/availability/bulk', data);
  return response.data;
};

/**
 * Bulk delete availability entries
 * @param {Array<string>} dates - Array of dates in YYYY-MM-DD format
 */
export const bulkDeleteAvailability = async (dates) => {
  const response = await apiClient.delete('/availability/bulk', {
    data: { dates }
  });
  return response.data;
};

/**
 * Update availability notes
 * @param {string} id - Availability ID
 * @param {string} notes - New notes
 */
export const updateAvailability = async (id, notes) => {
  const response = await apiClient.put(`/availability/${id}`, { notes });
  return response.data;
};

/**
 * Delete a single availability entry
 * @param {string} id - Availability ID
 */
export const deleteAvailability = async (id) => {
  const response = await apiClient.delete(`/availability/${id}`);
  return response.data;
};

/**
 * Admin: Bulk create availability for a specific user
 * @param {string} userId - User ID
 * @param {Object} data
 * @param {Array<string>} data.dates - Array of dates in YYYY-MM-DD format
 * @param {string} data.notes - Optional notes
 */
export const bulkCreateAvailabilityForUser = async (userId, data) => {
  const response = await apiClient.post(`/availability/admin/${userId}/bulk`, data);
  return response.data;
};

/**
 * Admin: Bulk delete availability for a specific user
 * @param {string} userId - User ID
 * @param {Array<string>} dates - Array of dates in YYYY-MM-DD format
 */
export const bulkDeleteAvailabilityForUser = async (userId, dates) => {
  const response = await apiClient.delete(`/availability/admin/${userId}/bulk`, {
    data: { dates }
  });
  return response.data;
};
