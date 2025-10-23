import apiClient from './client'

export const usersAPI = {
  async getAll(params = {}) {
    const response = await apiClient.get('/users', { params })
    return response.data
  },

  async getMe() {
    const response = await apiClient.get('/users/me')
    return response.data
  },

  async getEntertainers() {
    const response = await apiClient.get('/users/entertainers')
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  async create(userData) {
    const response = await apiClient.post('/users', userData)
    return response.data
  },

  async update(id, userData) {
    const response = await apiClient.put(`/users/${id}`, userData)
    return response.data
  },

  async deactivate(id) {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data
  },

  async reactivate(id) {
    const response = await apiClient.post(`/users/${id}/reactivate`)
    return response.data
  }
}
