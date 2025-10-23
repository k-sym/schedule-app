<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item" active-class="active">
        <span class="nav-icon">📊</span>
        <span class="nav-text">Dashboard</span>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/admin/users"
        class="nav-item"
        active-class="active"
      >
        <span class="nav-icon">👥</span>
        <span class="nav-text">Users</span>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/admin/areas"
        class="nav-item"
        active-class="active"
      >
        <span class="nav-icon">🏢</span>
        <span class="nav-text">Areas</span>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/schedule"
        class="nav-item"
        active-class="active"
      >
        <span class="nav-icon">📅</span>
        <span class="nav-text">Schedule</span>
      </router-link>

      <router-link
        v-if="isEntertainer"
        to="/availability"
        class="nav-item"
        active-class="active"
      >
        <span class="nav-icon">📅</span>
        <span class="nav-text">Availability</span>
      </router-link>

      <router-link to="/profile" class="nav-item" active-class="active">
        <span class="nav-icon">⚙️</span>
        <span class="nav-text">Profile</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
const isEntertainer = computed(() => authStore.isEntertainer)
</script>

<style scoped>
.app-sidebar {
  width: 240px;
  background: #f3f4f6;
  border-right: 1px solid #e5e7eb;
  height: calc(100vh - 64px);
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #374151;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #e5e7eb;
}

.nav-item.active {
  background: #dbeafe;
  border-left-color: #3b82f6;
  color: #1e40af;
  font-weight: 500;
}

.nav-icon {
  font-size: 1.25rem;
}

.nav-text {
  font-size: 0.875rem;
}
</style>
