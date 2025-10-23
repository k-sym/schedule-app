import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersAPI } from '@/api/users'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const entertainers = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAll(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await usersAPI.getAll(params)
      users.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEntertainers() {
    loading.value = true
    error.value = null
    try {
      const response = await usersAPI.getEntertainers()
      entertainers.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch entertainers'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData) {
    loading.value = true
    error.value = null
    try {
      const response = await usersAPI.create(userData)
      users.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id, userData) {
    loading.value = true
    error.value = null
    try {
      const response = await usersAPI.update(id, userData)
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deactivateUser(id) {
    loading.value = true
    error.value = null
    try {
      await usersAPI.deactivate(id)
      const user = users.value.find(u => u.id === id)
      if (user) {
        user.is_active = false
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to deactivate user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function reactivateUser(id) {
    loading.value = true
    error.value = null
    try {
      await usersAPI.reactivate(id)
      const user = users.value.find(u => u.id === id)
      if (user) {
        user.is_active = true
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to reactivate user'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    entertainers,
    loading,
    error,
    fetchAll,
    fetchEntertainers,
    createUser,
    updateUser,
    deactivateUser,
    reactivateUser
  }
})
