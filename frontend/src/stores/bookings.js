import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as bookingsApi from '@/api/bookings'

export const useBookingStore = defineStore('bookings', () => {
  // State
  const bookings = ref([])
  const currentBooking = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const bookingsByDate = computed(() => {
    const map = new Map()
    bookings.value.forEach(booking => {
      if (!map.has(booking.booking_date)) {
        map.set(booking.booking_date, [])
      }
      map.get(booking.booking_date).push(booking)
    })
    return map
  })

  const bookingsByArea = computed(() => {
    const map = new Map()
    bookings.value.forEach(booking => {
      const areaId = booking.area_id
      if (!map.has(areaId)) {
        map.set(areaId, [])
      }
      map.get(areaId).push(booking)
    })
    return map
  })

  // Actions

  /**
   * Fetch all bookings with optional filters
   */
  async function fetchBookings(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await bookingsApi.getBookings(filters)
      bookings.value = response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch bookings'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch bookings for a specific month
   */
  async function fetchBookingsForMonth(year, month) {
    loading.value = true
    error.value = null
    try {
      const response = await bookingsApi.getBookingsForMonth(year, month)
      bookings.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch bookings for month'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch own bookings (for entertainers)
   */
  async function fetchMyBookings(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await bookingsApi.getMyBookings(filters)
      bookings.value = response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch your bookings'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single booking by ID
   */
  async function fetchBookingById(bookingId) {
    loading.value = true
    error.value = null
    try {
      const response = await bookingsApi.getBookingById(bookingId)
      currentBooking.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new booking
   * @returns {Object} { success, booking, warnings, conflicts }
   */
  async function createBooking(bookingData) {
    loading.value = true
    error.value = null
    try {
      const response = await bookingsApi.createBooking(bookingData)

      // Add to local bookings array
      bookings.value.push(response.data)

      return {
        success: true,
        booking: response.data,
        warnings: response.warnings || []
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create booking'

      // Check if it's a conflict error
      if (err.response?.status === 409) {
        return {
          success: false,
          conflicts: err.response.data.conflicts || [],
          warnings: err.response.data.warnings || []
        }
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing booking
   * @returns {Object} { success, booking, warnings, conflicts }
   */
  async function updateBooking(bookingId, updates) {
    loading.value = true
    error.value = null
    try {
      const response = await bookingsApi.updateBooking(bookingId, updates)

      // Update in local array
      const index = bookings.value.findIndex(b => b.id === bookingId)
      if (index !== -1) {
        bookings.value[index] = response.data
      }

      return {
        success: true,
        booking: response.data,
        warnings: response.warnings || []
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update booking'

      // Check if it's a conflict error
      if (err.response?.status === 409) {
        return {
          success: false,
          conflicts: err.response.data.conflicts || [],
          warnings: err.response.data.warnings || []
        }
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete (cancel) a booking
   */
  async function deleteBooking(bookingId) {
    loading.value = true
    error.value = null
    try {
      await bookingsApi.deleteBooking(bookingId)

      // Remove from local array
      bookings.value = bookings.value.filter(b => b.id !== bookingId)

      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Validate a booking without creating it
   */
  async function validateBooking(bookingData) {
    try {
      const response = await bookingsApi.validateBooking(bookingData)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to validate booking'
      throw err
    }
  }

  /**
   * Get booking for a specific area and date
   */
  function getBookingForAreaAndDate(areaId, date) {
    return bookings.value.find(
      b => b.area_id === areaId && b.booking_date === date
    )
  }

  /**
   * Clear all bookings
   */
  function clearBookings() {
    bookings.value = []
    currentBooking.value = null
    error.value = null
  }

  return {
    // State
    bookings,
    currentBooking,
    loading,
    error,

    // Computed
    bookingsByDate,
    bookingsByArea,

    // Actions
    fetchBookings,
    fetchBookingsForMonth,
    fetchMyBookings,
    fetchBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    validateBooking,
    getBookingForAreaAndDate,
    clearBookings
  }
})
