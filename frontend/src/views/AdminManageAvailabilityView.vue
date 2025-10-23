<template>
  <div class="availability-layout">
    <AppHeader />
    <main class="availability-content">
      <div class="content-header">
        <div class="header-left">
          <button @click="goBack" class="btn-back">← Back to Users</button>
          <div class="header-title">
            <h1>Manage Availability</h1>
            <p class="subtitle" v-if="selectedUser">{{ selectedUser.name }}</p>
          </div>
        </div>
      </div>
      <div class="content-body">
        <div v-if="loading && !selectedUser" class="loading">
          Loading...
        </div>
        <div v-else-if="!selectedUser" class="error">
          User not found
        </div>
        <div v-else>
          <div class="instructions">
            <h3>How to use:</h3>
            <ul>
              <li><strong>Click on dates</strong> to select multiple days</li>
              <li><strong>Use "Add Selected"</strong> to mark days as available</li>
              <li><strong>Use "Remove Selected"</strong> to remove availability</li>
              <li>Green highlighted dates = Act is available</li>
              <li>Blue selection = Days you've selected</li>
            </ul>
          </div>

          <AdminAvailabilityCalendar
            :user-id="userId"
            @dates-updated="handleDatesUpdated"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { useToast } from '@/composables/useToast'
import AppHeader from '@/components/common/AppHeader.vue'
import AdminAvailabilityCalendar from '@/components/availability/AdminAvailabilityCalendar.vue'

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const { showToast } = useToast()

const userId = computed(() => route.params.userId)
const loading = ref(false)

const selectedUser = computed(() => {
  return usersStore.users.find(u => u.id === userId.value)
})

function handleDatesUpdated() {
  showToast('Availability updated successfully', 'success')
}

function goBack() {
  router.push({ name: 'admin-users' })
}

onMounted(async () => {
  loading.value = true
  try {
    // Ensure we have users loaded
    if (usersStore.users.length === 0) {
      await usersStore.fetchAll()
    }
  } catch (error) {
    console.error('Failed to load user:', error)
    showToast('Failed to load user', 'error')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.availability-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.availability-content {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
}

.content-header {
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.header-title h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.875rem;
  color: #111827;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
}

.content-body {
  padding: 2rem;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.error {
  color: #ef4444;
}

.instructions {
  background: #e3f2fd;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #2196F3;
  margin-bottom: 2rem;
}

.instructions h3 {
  margin: 0 0 10px 0;
  color: #1976D2;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin: 8px 0;
  color: #333;
}

@media (max-width: 768px) {
  .content-body {
    padding: 15px;
  }

  .header-title h1 {
    font-size: 1.5rem;
  }

  .instructions {
    padding: 15px;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
