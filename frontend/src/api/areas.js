import apiClient from './client'

export const areasAPI = {
  async getAll(params = {}) {
    const response = await apiClient.get('/areas', { params })
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/areas/${id}`)
    return response.data
  },

  async create(areaData) {
    const response = await apiClient.post('/areas', areaData)
    return response.data
  },

  async update(id, areaData) {
    const response = await apiClient.put(`/areas/${id}`, areaData)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/areas/${id}`)
    return response.data
  },

  async reorder(areas) {
    const response = await apiClient.put('/areas/reorder', { areas })
    return response.data
  }
}
