import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as availabilityAPI from '@/api/availability'

export const useAvailabilityStore = defineStore('availability', () => {
  const availability = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentMonth = ref(new Date().getMonth() + 1)
  const currentYear = ref(new Date().getFullYear())

  // Computed: Get availability dates as Set for quick lookup
  const availableDates = computed(() => {
    return new Set(availability.value.map(a => a.available_date))
  })

  // Function: Check if specific date is available
  function isDateAvailable(date) {
    const dateStr = typeof date === 'string' ? date : formatDate(date)
    return availableDates.value.has(dateStr)
  }

  /**
   * Format date to YYYY-MM-DD
   */
  function formatDate(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Fetch current user's availability (for entertainers)
   */
  async function fetchMyAvailability(startDate = null, endDate = null) {
    console.log('[STORE] fetchMyAvailability called', { startDate, endDate, currentLoading: loading.value });
    console.trace('[STORE] Call stack for fetchMyAvailability');

    loading.value = true
    error.value = null
    try {
      const params = {}
      if (startDate) params.startDate = formatDate(startDate)
      if (endDate) params.endDate = formatDate(endDate)

      console.log('[STORE] Calling API with params:', params);
      const response = await availabilityAPI.getMyAvailability(params)
      console.log('[STORE] API returned:', response);
      availability.value = response.data
      return response.data
    } catch (err) {
      console.error('[STORE] Error:', err);
      error.value = err.response?.data?.error || 'Failed to fetch availability'
      throw err
    } finally {
      console.log('[STORE] Setting loading to false');
      loading.value = false
    }
  }

  /**
   * Fetch availability for specific entertainer (for admins)
   */
  async function fetchAvailabilityByEntertainer(entertainerId, startDate = null, endDate = null) {
    loading.value = true
    error.value = null
    try {
      const params = { entertainerId }
      if (startDate) params.startDate = formatDate(startDate)
      if (endDate) params.endDate = formatDate(endDate)

      const response = await availabilityAPI.getAvailability(params)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch availability'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch availability for entire month (all entertainers)
   */
  async function fetchMonthAvailability(year, month) {
    loading.value = true
    error.value = null
    try {
      const response = await availabilityAPI.getAvailabilityForMonth(year, month)
      currentYear.value = year
      currentMonth.value = month
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch monthly availability'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create single availability entry
   */
  async function createAvailability(availableDate, notes = null) {
    loading.value = true
    error.value = null
    try {
      const data = {
        availableDate: formatDate(availableDate),
        notes
      }
      const response = await availabilityAPI.createAvailability(data)
      availability.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create availability'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Bulk add availability for multiple dates
   */
  async function addMultipleDates(dates, notes = null) {
    loading.value = true
    error.value = null
    try {
      const formattedDates = dates.map(d => formatDate(d))
      const response = await availabilityAPI.bulkCreateAvailability({
        dates: formattedDates,
        notes
      })

      // Refresh availability to get updated list
      await fetchMyAvailability()
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to add availability'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Bulk remove availability for multiple dates
   */
  async function removeMultipleDates(dates) {
    loading.value = true
    error.value = null
    try {
      const formattedDates = dates.map(d => formatDate(d))
      const response = await availabilityAPI.bulkDeleteAvailability(formattedDates)

      // Remove from local state
      availability.value = availability.value.filter(
        a => !formattedDates.includes(a.available_date)
      )

      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to remove availability'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Toggle availability for a single date
   */
  async function toggleDate(date) {
    const dateStr = formatDate(date)
    if (isDateAvailable(dateStr)) {
      // Find and delete
      const item = availability.value.find(a => a.available_date === dateStr)
      if (item) {
        await deleteAvailability(item.id)
      }
    } else {
      // Create new
      await createAvailability(date)
    }
  }

  /**
   * Delete single availability entry
   */
  async function deleteAvailability(id) {
    loading.value = true
    error.value = null
    try {
      await availabilityAPI.deleteAvailability(id)
      availability.value = availability.value.filter(a => a.id !== id)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete availability'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update availability notes
   */
  async function updateNotes(id, notes) {
    loading.value = true
    error.value = null
    try {
      const response = await availabilityAPI.updateAvailability(id, notes)
      const index = availability.value.findIndex(a => a.id === id)
      if (index !== -1) {
        availability.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update availability'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear all availability data
   */
  function clearAvailability() {
    availability.value = []
    error.value = null
  }

  return {
    availability,
    loading,
    error,
    currentMonth,
    currentYear,
    availableDates,
    isDateAvailable,
    fetchMyAvailability,
    fetchAvailabilityByEntertainer,
    fetchMonthAvailability,
    createAvailability,
    addMultipleDates,
    removeMultipleDates,
    toggleDate,
    deleteAvailability,
    updateNotes,
    clearAvailability
  }
})
