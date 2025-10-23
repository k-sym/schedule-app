<template>
  <div class="availability-calendar">
    <h2>Simple Calendar Test</h2>
    <p>Current Month: {{ currentMonth }}/{{ currentYear }}</p>
    <button @click="testLoad">Manual Load</button>
    <p>Loading: {{ loading }}</p>
    <p>Available dates count: {{ availabilityCount }}</p>

    <div v-if="availabilityCount > 0">
      <h3>Available Dates:</h3>
      <ul>
        <li v-for="item in availabilityList" :key="item.id">
          {{ item.available_date }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAvailabilityStore } from '@/stores/availability'

const availabilityStore = useAvailabilityStore()
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const loading = ref(false)
const availabilityCount = ref(0)
const availabilityList = ref([])

async function testLoad() {
  if (loading.value) {
    console.log('Already loading, skipping')
    return
  }

  loading.value = true
  console.log('Starting load...')

  const startDate = new Date(currentYear.value, currentMonth.value - 1, 1)
  const endDate = new Date(currentYear.value, currentMonth.value, 0)

  try {
    const result = await availabilityStore.fetchMyAvailability(startDate, endDate)
    console.log('Load complete', result)
    // Copy data to local refs to avoid reactive dependency
    availabilityList.value = [...availabilityStore.availability]
    availabilityCount.value = availabilityStore.availability.length
  } catch (error) {
    console.error('Load failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.availability-calendar {
  padding: 20px;
}

button {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 0;
}

button:hover {
  background: #45a049;
}
</style>
