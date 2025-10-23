import apiClient from './client'

/**
 * Get all bookings with optional filters
 * @param {Object} params - { startDate, endDate, areaId, entertainerId, status }
 * @returns {Promise<Array>} Array of bookings
 */
export const getBookings = async (params = {}) => {
  const response = await apiClient.get('/bookings', { params })
  return response.data
}

/**
 * Get bookings for a specific month
 * @param {number} year
 * @param {number} month - 1-12
 * @returns {Promise<Array>} Array of bookings
 */
export const getBookingsForMonth = async (year, month) => {
  const response = await apiClient.get(`/bookings/month/${year}/${month}`)
  return response.data
}

/**
 * Get own bookings (for entertainers)
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise<Array>} Array of bookings
 */
export const getMyBookings = async (params = {}) => {
  const response = await apiClient.get('/bookings/me', { params })
  return response.data
}

/**
 * Get a single booking by ID
 * @param {string} bookingId
 * @returns {Promise<Object>} Booking object
 */
export const getBookingById = async (bookingId) => {
  const response = await apiClient.get(`/bookings/${bookingId}`)
  return response.data
}

/**
 * Create a new booking
 * @param {Object} bookingData - { entertainerId, areaId, bookingDate, notes }
 * @returns {Promise<Object>} Created booking
 */
export const createBooking = async (bookingData) => {
  const response = await apiClient.post('/bookings', bookingData)
  return response.data
}

/**
 * Update an existing booking
 * @param {string} bookingId
 * @param {Object} updates - { entertainerId, areaId, bookingDate, notes, status }
 * @returns {Promise<Object>} Updated booking
 */
export const updateBooking = async (bookingId, updates) => {
  const response = await apiClient.put(`/bookings/${bookingId}`, updates)
  return response.data
}

/**
 * Delete (cancel) a booking
 * @param {string} bookingId
 * @returns {Promise<Object>} Success response
 */
export const deleteBooking = async (bookingId) => {
  const response = await apiClient.delete(`/bookings/${bookingId}`)
  return response.data
}

/**
 * Validate a booking without creating it
 * @param {Object} bookingData - { entertainerId, areaId, bookingDate, excludeBookingId }
 * @returns {Promise<Object>} Validation result { valid, conflicts, warnings }
 */
export const validateBooking = async (bookingData) => {
  const response = await apiClient.post('/bookings/validate', bookingData)
  return response.data
}
