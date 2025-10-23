<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-main">
      <AppSidebar />
      <main class="dashboard-content">
        <div class="content-header">
          <h1>Dashboard</h1>
        </div>
        <div class="content-body">
          <div class="welcome-card">
            <h2>Welcome, {{ user?.name }}!</h2>
            <p>Schedule App - Phase 2 Frontend Implementation</p>
            <div class="quick-stats" v-if="isAdmin">
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                  <div class="stat-label">Total Users</div>
                  <div class="stat-value">{{ totalUsers }}</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🎭</div>
                <div class="stat-info">
                  <div class="stat-label">Entertainers</div>
                  <div class="stat-value">{{ totalEntertainers }}</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🏢</div>
                <div class="stat-info">
                  <div class="stat-label">Areas</div>
                  <div class="stat-value">{{ totalAreas }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useAreasStore } from '@/stores/areas'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const areasStore = useAreasStore()

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const totalUsers = computed(() => usersStore.users.length)
const totalEntertainers = computed(() => usersStore.users.filter(u => u.role === 'entertainer').length)
const totalAreas = computed(() => areasStore.areas.length)

onMounted(async () => {
  if (isAdmin.value) {
    try {
      await usersStore.fetchAll()
      await areasStore.fetchAll()
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    }
  }
})
</script>

<style scoped>
.dashboard-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
}

.content-header {
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.content-header h1 {
  margin: 0;
  font-size: 1.875rem;
  color: #111827;
}

.content-body {
  padding: 2rem;
}

.welcome-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  margin: 0 0 0.5rem;
  color: #111827;
}

.welcome-card p {
  margin: 0 0 2rem;
  color: #6b7280;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 600;
  color: #111827;
}
</style>
