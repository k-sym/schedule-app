import apiClient from './client'

/**
 * Get all area rules
 * @returns {Promise<Array>} Array of area rules
 */
export async function getAllRules() {
  const response = await apiClient.get('/area-rules')
  return response.data
}

/**
 * Get rules for a specific area
 * @param {string} areaId - UUID of the area
 * @returns {Promise<Array>} Array of rules for the area
 */
export async function getRulesByArea(areaId) {
  const response = await apiClient.get(`/area-rules/area/${areaId}`)
  return response.data
}

/**
 * Create or update an area rule
 * @param {Object} ruleData - { area_id, day_of_week, default_emoji }
 * @returns {Promise<Object>} Created/updated rule
 */
export async function createOrUpdateRule(ruleData) {
  const response = await apiClient.post('/area-rules', ruleData)
  return response.data
}

/**
 * Delete an area rule
 * @param {string} ruleId - UUID of the rule
 * @returns {Promise<void>}
 */
export async function deleteRule(ruleId) {
  await apiClient.delete(`/area-rules/${ruleId}`)
}
