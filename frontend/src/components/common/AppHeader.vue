<template>
  <header class="app-header">
    <div class="header-top">
      <h1 class="app-title">Schedule App</h1>
      <div class="header-right">
        <span class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role" :class="`role-${user?.role}`">{{ user?.role }}</span>
        </span>
        <button class="btn-logout" @click="handleLogout">Logout</button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="nav-tabs">
      <router-link to="/dashboard" class="nav-tab" active-class="active">
        Dashboard
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/schedule"
        class="nav-tab"
        active-class="active"
      >
        Schedule
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/admin/users"
        class="nav-tab"
        active-class="active"
      >
        Users
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/admin/areas"
        class="nav-tab"
        active-class="active"
      >
        Areas
      </router-link>

      <router-link
        v-if="isEntertainer"
        to="/availability"
        class="nav-tab"
        active-class="active"
      >
        Availability
      </router-link>

      <router-link to="/profile" class="nav-tab" active-class="active">
        Profile
      </router-link>
    </nav>
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
const isAdmin = computed(() => authStore.isAdmin)
const isEntertainer = computed(() => authStore.isEntertainer)
const userName = computed(() => {
  if (!user.value) return ''
  return `${user.value.first_name} ${user.value.last_name}`
})

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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
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

/* Navigation Tabs */
.nav-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 2rem;
  background: #111827;
  border-top: 1px solid #374151;
}

.nav-tab {
  padding: 0.75rem 1.5rem;
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.nav-tab:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.nav-tab.active {
  color: white;
  border-bottom-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}
</style>
