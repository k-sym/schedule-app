import apiClient from './client'

export const authAPI = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  },

  async logout(refreshToken) {
    const response = await apiClient.post('/auth/logout', { refreshToken })
    return response.data
  },

  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  }
}
