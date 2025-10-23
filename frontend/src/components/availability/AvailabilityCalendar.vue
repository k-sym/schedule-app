<template>
  <div class="availability-calendar">
    <!-- Month Navigation -->
    <div class="calendar-header">
      <button @click="previousMonth" class="btn-nav">
        <span>←</span>
      </button>
      <h2 class="month-title">
        {{ monthName }} {{ currentYear }}
      </h2>
      <button @click="nextMonth" class="btn-nav">
        <span>→</span>
      </button>
    </div>

    <!-- Weekday Headers -->
    <div class="calendar-weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <div
        v-for="day in calendarDays"
        :key="day.dateStr"
        class="calendar-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'past': day.isPast,
          'available': day.isAvailable,
          'selected': isSelected(day.dateStr)
        }"
        @click="handleDayClick(day)"
      >
        <div class="day-number">{{ day.day }}</div>
        <div v-if="day.isAvailable && day.isCurrentMonth" class="check-mark">✓</div>
      </div>
    </div>

    <!-- Summary -->
    <div class="calendar-summary">
      <p>
        <strong>{{ availableCount }}</strong> days marked available
        <span v-if="selectedDates.size > 0" class="selected-info">
          ({{ selectedDates.size }} selected)
        </span>
      </p>
      
      <div v-if="selectedDates.size > 0" class="action-buttons">
        <button 
          @click="handleBulkAdd" 
          class="btn-add"
          :disabled="loading"
        >
          Add Selected
        </button>
        <button 
          @click="handleBulkRemove" 
          class="btn-remove"
          :disabled="loading"
        >
          Remove Selected
        </button>
        <button 
          @click="clearSelection" 
          class="btn-clear"
          :disabled="loading"
        >
          Clear Selection
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAvailabilityStore } from '@/stores/availability'

const availabilityStore = useAvailabilityStore()

const props = defineProps({
  selectionMode: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['date-selected', 'dates-updated'])

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1) // 1-12
const selectedDates = ref(new Set())
const isLoadingAvailability = ref(false)
const lastLoadedKey = ref('')
const loading = computed(() => availabilityStore.loading)

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const monthName = computed(() => monthNames[currentMonth.value - 1])

const availableCount = computed(() => {
  return availabilityStore.availability.filter(a => {
    const date = new Date(a.available_date)
    return date.getMonth() + 1 === currentMonth.value && 
           date.getFullYear() === currentYear.value
  }).length
})

/**
 * Generate calendar days for the current month view
 */
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  
  // First day of month
  const firstDay = new Date(year, month - 1, 1)
  const firstDayOfWeek = firstDay.getDay()
  
  // Last day of month
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 2, day)
    days.push({
      day,
      date,
      dateStr: formatDate(date),
      isCurrentMonth: false,
      isToday: false,
      isPast: date < today,
      isAvailable: false
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dateStr = formatDate(date)
    days.push({
      day,
      date,
      dateStr,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isPast: date < today,
      isAvailable: availabilityStore.isDateAvailable(dateStr)
    })
  }
  
  // Next month days to fill grid
  const remainingCells = 42 - days.length // 6 rows * 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month, day)
    days.push({
      day,
      date,
      dateStr: formatDate(date),
      isCurrentMonth: false,
      isToday: false,
      isPast: date < today,
      isAvailable: false
    })
  }
  
  return days
})

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isSelected(dateStr) {
  return selectedDates.value.has(dateStr)
}

function handleDayClick(day) {
  // Don't allow selection of past dates or other month dates
  if (day.isPast || !day.isCurrentMonth) {
    return
  }
  
  if (props.selectionMode) {
    // Toggle selection
    if (selectedDates.value.has(day.dateStr)) {
      selectedDates.value.delete(day.dateStr)
    } else {
      selectedDates.value.add(day.dateStr)
    }
    emit('date-selected', { date: day.dateStr, selected: selectedDates.value.has(day.dateStr) })
  } else {
    // Direct toggle availability
    toggleDateAvailability(day.dateStr)
  }
}

async function toggleDateAvailability(dateStr) {
  try {
    await availabilityStore.toggleDate(dateStr)
    emit('dates-updated')
  } catch (error) {
    console.error('Error toggling availability:', error)
  }
}

async function handleBulkAdd() {
  if (selectedDates.value.size === 0) return

  try {
    const dates = Array.from(selectedDates.value)
    await availabilityStore.addMultipleDates(dates)
    selectedDates.value.clear()
    emit('dates-updated')
  } catch (error) {
    console.error('Error adding dates:', error)
  }
}

async function handleBulkRemove() {
  if (selectedDates.value.size === 0) return

  try {
    const dates = Array.from(selectedDates.value)
    await availabilityStore.removeMultipleDates(dates)
    selectedDates.value.clear()
    emit('dates-updated')
  } catch (error) {
    console.error('Error removing dates:', error)
  }
}

function clearSelection() {
  selectedDates.value.clear()
}

function previousMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

async function loadAvailability() {
  // Create a unique key for this month/year combination
  const loadKey = `${currentYear.value}-${currentMonth.value}`

  // If we're already loading OR we've already loaded this month, skip
  if (isLoadingAvailability.value || lastLoadedKey.value === loadKey) {
    return
  }

  isLoadingAvailability.value = true
  lastLoadedKey.value = loadKey

  const startDate = new Date(currentYear.value, currentMonth.value - 1, 1)
  const endDate = new Date(currentYear.value, currentMonth.value, 0)

  try {
    await availabilityStore.fetchMyAvailability(startDate, endDate)
  } catch (error) {
    console.error('Failed to load availability:', error)
    lastLoadedKey.value = '' // Reset on error so we can retry
  } finally {
    isLoadingAvailability.value = false
  }
}

// Watch for month/year changes
watch([currentMonth, currentYear], async () => {
  selectedDates.value.clear()
  lastLoadedKey.value = '' // Reset so new month will load
  await loadAvailability()
}, { immediate: false })

onMounted(async () => {
  await loadAvailability()
})
</script>

<style scoped>
.availability-calendar {
  max-width: 800px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.month-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.btn-nav {
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

.btn-nav:hover {
  background: #e0e0e0;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #666;
  text-align: center;
}

.weekday {
  padding: 10px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: #e0e0e0;
  border: 1px solid #e0e0e0;
}

.calendar-cell {
  background: white;
  min-height: 80px;
  padding: 8px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.calendar-cell:hover:not(.past):not(.other-month) {
  background: #f5f5f5;
}

.calendar-cell.other-month {
  background: #fafafa;
  color: #ccc;
  cursor: default;
}

.calendar-cell.past {
  background: #f9f9f9;
  color: #999;
  cursor: not-allowed;
}

.calendar-cell.today {
  border: 2px solid #4CAF50;
}

.calendar-cell.available {
  background: #e8f5e9;
}

.calendar-cell.available.selected {
  background: #ffcdd2;
}

.calendar-cell.selected:not(.available) {
  background: #c8e6c9;
}

.day-number {
  font-size: 1rem;
  font-weight: 500;
}

.check-mark {
  font-size: 1.5rem;
  color: #4CAF50;
  font-weight: bold;
}

.calendar-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.calendar-summary p {
  margin: 0 0 15px 0;
  font-size: 1rem;
}

.selected-info {
  color: #666;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: opacity 0.2s;
}

.action-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add {
  background: #4CAF50;
  color: white;
}

.btn-add:hover:not(:disabled) {
  background: #45a049;
}

.btn-remove {
  background: #f44336;
  color: white;
}

.btn-remove:hover:not(:disabled) {
  background: #da190b;
}

.btn-clear {
  background: #757575;
  color: white;
}

.btn-clear:hover:not(:disabled) {
  background: #616161;
}

@media (max-width: 768px) {
  .calendar-cell {
    min-height: 60px;
    padding: 4px;
  }
  
  .day-number {
    font-size: 0.9rem;
  }
  
  .check-mark {
    font-size: 1.2rem;
  }
  
  .month-title {
    font-size: 1.2rem;
  }
}
</style>
