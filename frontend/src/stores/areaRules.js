import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllRules, getRulesByArea, createOrUpdateRule, deleteRule } from '@/api/areaRules'

export const useAreaRulesStore = defineStore('areaRules', () => {
  // State
  const rules = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getRulesByAreaId = computed(() => {
    return (areaId) => {
      return rules.value.filter(rule => rule.area_id === areaId)
    }
  })

  /**
   * Get default emoji for a specific area and date
   * @param {string} areaId - UUID of the area
   * @param {Date|string} date - Date to check
   * @returns {string|null} - Default emoji or null
   */
  const getDefaultEmoji = computed(() => {
    return (areaId, date) => {
      const bookingDate = new Date(date)
      const dayOfWeek = bookingDate.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday

      const rule = rules.value.find(
        r => r.area_id === areaId && r.day_of_week === dayOfWeek
      )

      return rule ? rule.default_emoji : null
    }
  })

  // Actions
  async function fetchAllRules() {
    loading.value = true
    error.value = null

    try {
      const data = await getAllRules()
      rules.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Failed to fetch area rules'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRulesByArea(areaId) {
    loading.value = true
    error.value = null

    try {
      const data = await getRulesByArea(areaId)
      // Update rules array with fetched rules
      // Remove old rules for this area
      rules.value = rules.value.filter(r => r.area_id !== areaId)
      // Add new rules
      rules.value.push(...data)
      return data
    } catch (err) {
      error.value = err.message || 'Failed to fetch area rules'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createRule(areaId, dayOfWeek, defaultEmoji) {
    loading.value = true
    error.value = null

    try {
      const rule = await createOrUpdateRule({
        area_id: areaId,
        day_of_week: dayOfWeek,
        default_emoji: defaultEmoji
      })

      // Update or add to rules array
      const existingIndex = rules.value.findIndex(
        r => r.area_id === areaId && r.day_of_week === dayOfWeek
      )

      if (existingIndex !== -1) {
        rules.value[existingIndex] = rule
      } else {
        rules.value.push(rule)
      }

      return rule
    } catch (err) {
      error.value = err.message || 'Failed to create/update area rule'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeRule(ruleId) {
    loading.value = true
    error.value = null

    try {
      await deleteRule(ruleId)

      // Remove from rules array
      const index = rules.value.findIndex(r => r.id === ruleId)
      if (index !== -1) {
        rules.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete area rule'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    rules,
    loading,
    error,

    // Getters
    getRulesByAreaId,
    getDefaultEmoji,

    // Actions
    fetchAllRules,
    fetchRulesByArea,
    createRule,
    removeRule,
    clearError
  }
})
