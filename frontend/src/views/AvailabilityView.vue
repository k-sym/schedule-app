<template>
  <div class="availability-layout">
    <AppHeader />
    <div class="availability-main">
      <main class="availability-content">
        <div class="content-header">
          <h1>My Availability</h1>
          <p class="subtitle">Mark the days you are available to perform</p>
        </div>
        <div class="content-body">
          <AvailabilityCalendarFixed @dates-updated="handleDatesUpdated" />
          <div class="instructions">
            <h3>How to use:</h3>
            <ul>
              <li><strong>Click on dates</strong> to select multiple days</li>
              <li><strong>Use "Add Selected"</strong> to mark days as available</li>
              <li><strong>Use "Remove Selected"</strong> to remove availability</li>
              <li>Green highlighted dates = You are available</li>
              <li>Blue selection = Days you've selected</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AvailabilityCalendarFixed from '@/components/availability/AvailabilityCalendarFixed.vue'

const authStore = useAuthStore()
const router = useRouter()
const { showToast } = useToast()

function handleDatesUpdated() {
  showToast('Availability updated successfully', 'success')
}

onMounted(() => {
  // Check if user is act
  if (authStore.user?.role !== 'entertainer') {
    showToast('Only acts can manage availability', 'error')
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.availability-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.availability-main {
  display: flex;
  flex: 1;
  overflow: hidden;
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

.content-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.875rem;
  color: #111827;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.content-body {
  padding: 2rem;
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

  .content-header h1 {
    font-size: 1.5rem;
  }

  .instructions {
    padding: 15px;
  }
}
</style>
