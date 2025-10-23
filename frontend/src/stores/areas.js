import { defineStore } from 'pinia'
import { ref } from 'vue'
import { areasAPI } from '@/api/areas'

export const useAreasStore = defineStore('areas', () => {
  const areas = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAll(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await areasAPI.getAll(params)
      areas.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch areas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createArea(areaData) {
    loading.value = true
    error.value = null
    try {
      const response = await areasAPI.create(areaData)
      areas.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create area'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateArea(id, areaData) {
    loading.value = true
    error.value = null
    try {
      const response = await areasAPI.update(id, areaData)
      const index = areas.value.findIndex(a => a.id === id)
      if (index !== -1) {
        areas.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update area'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteArea(id) {
    loading.value = true
    error.value = null
    try {
      await areasAPI.delete(id)
      const area = areas.value.find(a => a.id === id)
      if (area) {
        area.is_active = false
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete area'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function reorderAreas(reorderedAreas) {
    loading.value = true
    error.value = null
    try {
      await areasAPI.reorder(reorderedAreas)
      // Update local state with new order
      reorderedAreas.forEach(({ id, display_order }) => {
        const area = areas.value.find(a => a.id === id)
        if (area) {
          area.display_order = display_order
        }
      })
      // Re-sort areas by display_order
      areas.value.sort((a, b) => a.display_order - b.display_order)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to reorder areas'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    areas,
    loading,
    error,
    fetchAll,
    createArea,
    updateArea,
    deleteArea,
    reorderAreas
  }
})
