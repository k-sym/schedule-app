<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="app-title">Schedule App</h1>
      <div class="header-right">
        <span class="user-info">
          <span class="user-name">{{ user?.first_name }} {{ user?.last_name }}</span>
          <span class="user-role" :class="`role-${user?.role}`">{{ user?.role }}</span>
        </span>
        <button class="btn-logout" @click="handleLogout">Logout</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

const user = computed(() => authStore.user)

async function handleLogout() {
  try {
    await authAPI.logout(authStore.refreshToken)
    authStore.clearAuth()
    success('Logged out successfully')
    router.push('/login')
  } catch (err) {
    error('Failed to logout')
    // Still clear auth locally even if API call fails
    authStore.clearAuth()
    router.push('/login')
  }
}
</script>

<style scoped>
.app-header {
  background: #1f2937;
  color: white;
  padding: 0 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  height: 64px;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.user-role {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 2px;
  text-transform: capitalize;
}

.role-admin {
  background: #ef4444;
  color: white;
}

.role-entertainer {
  background: #3b82f6;
  color: white;
}

.btn-logout {
  background: #374151;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #4b5563;
}
</style>
