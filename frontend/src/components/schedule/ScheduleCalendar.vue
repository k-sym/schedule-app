<template>
  <div class="schedule-container">
    <!-- Month Navigation -->
    <div class="month-navigation">
      <button @click="previousMonth" class="nav-btn">&lt; Previous</button>
      <h2 class="month-title">{{ monthName }} {{ currentYear }}</h2>
      <div class="nav-right">
        <button
          @click="exportToImage"
          class="export-btn"
          :disabled="isExporting || loading"
        >
          {{ isExporting ? 'Exporting...' : 'Export as Image' }}
        </button>
        <button @click="nextMonth" class="nav-btn">Next &gt;</button>
      </div>
    </div>

    <div class="schedule-layout">
      <!-- Traditional Calendar Grid -->
      <div class="calendar-section">
        <div v-if="loading" class="loading">Loading schedule...</div>

        <div v-else class="calendar-grid">
          <!-- Weekday Headers -->
          <div class="calendar-header">
            <div v-for="day in weekdays" :key="day" class="weekday-header">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="calendar-body">
            <!-- Empty cells for days before month starts -->
            <div
              v-for="n in firstDayOfWeek"
              :key="`empty-${n}`"
              class="calendar-day empty"
            ></div>

            <!-- Actual month days -->
            <div
              v-for="day in daysInMonth"
              :key="day"
              class="calendar-day"
              :class="{ 'is-today': isToday(day) }"
            >
              <div class="day-header">
                <span class="day-number">{{ day }}</span>
              </div>

              <!-- Area Sections within each day -->
              <div class="area-sections">
                <div
                  v-for="area in areas"
                  :key="area.id"
                  class="area-section"
                  :class="{ 'drag-over': dragOverTarget === `${area.id}-${day}` }"
                  :data-area-id="area.id"
                  :data-day="day"
                  @drop="handleDrop($event, area.id, day)"
                  @dragover.prevent
                  @dragenter="handleDragEnter($event, area.id, day)"
                  @dragleave="handleDragLeave"
                >
                  <!-- Rotated Abbreviation -->
                  <div class="area-abbreviation" :title="area.name">
                    <span
                      v-for="(char, index) in getReversedAbbreviation(area)"
                      :key="index"
                      class="abbr-char"
                    >
                      {{ char }}
                    </span>
                  </div>

                  <!-- Booking Display -->
                  <div
                    v-if="hasBooking(area.id, day)"
                    class="booking"
                    :class="getBookingClass(area.id, day)"
                    @click="openBookingEditModal(getBooking(area.id, day))"
                  >
                    <span class="booking-content">
                      <span v-if="getBooking(area.id, day).emoji" class="booking-emoji">{{ getBooking(area.id, day).emoji }}</span>
                      <span class="booking-name">
                        {{ getBookingDisplayText(area.id, day) }}
                      </span>
                    </span>
                  </div>

                  <!-- Empty Drop Zone -->
                  <div v-else class="drop-zone">
                    <span class="drop-hint">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acts Sidebar -->
      <div class="entertainers-sidebar">
        <h3>Acts</h3>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Acts..."
          class="search-input"
        />
        <div class="entertainers-list">
          <div
            v-for="entertainer in filteredEntertainers"
            :key="entertainer.id"
            class="entertainer-card"
            draggable="true"
            @dragstart="handleDragStart($event, entertainer)"
            @dragend="handleDragEnd"
          >
            <span class="entertainer-name">
              {{ entertainer.name }}
            </span>
            <span
              class="availability-badge"
              :class="{ available: isAvailableOnDate(entertainer.id, selectedDate) }"
            >
              {{ isAvailableOnDate(entertainer.id, selectedDate) ? '✓' : '⚠' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Edit Modal -->
    <BookingEditModal
      :is-open="showBookingEditModal"
      :booking="selectedBooking"
      @close="closeBookingEditModal"
      @save="handleBookingSave"
      @delete="handleBookingDelete"
    />

    <!-- Conflict Modal -->
    <div v-if="showConflictModal" class="modal-overlay" @click="closeConflictModal">
      <div class="modal-content" @click.stop>
        <h3>{{ conflicts.length > 0 ? 'Booking Conflicts' : 'Warnings' }}</h3>

        <div v-if="conflicts.length > 0" class="conflicts-section">
          <div v-for="(conflict, index) in conflicts" :key="index" class="conflict-message">
            <span class="conflict-icon">❌</span>
            <p>{{ conflict.message }}</p>
          </div>
        </div>

        <div v-if="warnings.length > 0" class="warnings-section">
          <h4 v-if="conflicts.length > 0">Warnings:</h4>
          <div v-for="(warning, index) in warnings" :key="index" class="warning-message">
            <span class="warning-icon">⚠️</span>
            <p>{{ warning.message }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeConflictModal" class="btn-close">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBookingStore } from '@/stores/bookings'
import { useUsersStore } from '@/stores/users'
import { useAreasStore } from '@/stores/areas'
import { useAvailabilityStore } from '@/stores/availability'
import { useAreaRulesStore } from '@/stores/areaRules'
import BookingEditModal from './BookingEditModal.vue'
import html2canvas from 'html2canvas'

const bookingStore = useBookingStore()
const userStore = useUsersStore()
const areaStore = useAreasStore()
const availabilityStore = useAvailabilityStore()
const areaRulesStore = useAreaRulesStore()

// State
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const loading = ref(false)
const searchQuery = ref('')
const draggedEntertainer = ref(null)
const selectedDate = ref(null)
const dragOverTarget = ref(null)
const showConflictModal = ref(false)
const conflicts = ref([])
const warnings = ref([])
const showBookingEditModal = ref(false)
const selectedBooking = ref(null)
const isExporting = ref(false)

// Local copies
const localBookings = ref([])
const localAvailability = ref([])

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Computed
const monthName = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value - 1, 1)
  return date.toLocaleString('default', { month: 'long' })
})

const daysInMonth = computed(() => {
  const days = new Date(currentYear.value, currentMonth.value, 0).getDate()
  return Array.from({ length: days }, (_, i) => i + 1)
})

const firstDayOfWeek = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value - 1, 1)
  return date.getDay()
})

const areas = computed(() => areaStore.areas)

const entertainers = computed(() => {
  return userStore.users.filter(u => u.role === 'entertainer')
})

const filteredEntertainers = computed(() => {
  if (!searchQuery.value) return entertainers.value
  const query = searchQuery.value.toLowerCase()
  return entertainers.value.filter(e =>
    e.name.toLowerCase().includes(query)
  )
})

// Methods
function formatDate(day) {
  const month = String(currentMonth.value).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  return `${currentYear.value}-${month}-${dayStr}`
}

function isToday(day) {
  const today = new Date()
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() + 1 &&
    currentYear.value === today.getFullYear()
  )
}

function hasBooking(areaId, day) {
  const dateStr = formatDate(day)
  return localBookings.value.some(
    b => b.area_id === areaId && b.booking_date === dateStr
  )
}

function getBooking(areaId, day) {
  const dateStr = formatDate(day)
  return localBookings.value.find(
    b => b.area_id === areaId && b.booking_date === dateStr
  )
}

function getEntertainerName(areaId, day) {
  const booking = getBooking(areaId, day)
  if (!booking || !booking.entertainer) return ''
  return booking.entertainer.name
}

function getBookingDisplayText(areaId, day) {
  const booking = getBooking(areaId, day)
  if (!booking) return ''
  
  // If display_note is set, show it instead of entertainer name
  if (booking.display_note) {
    return booking.display_note
  }
  
  // Otherwise show entertainer name
  return booking.entertainer ? booking.entertainer.name : ''
}

function getBookingClass(areaId, day) {
  const booking = getBooking(areaId, day)
  if (!booking) return ''

  const dateStr = formatDate(day)
  const isAvailable = isAvailableOnDate(booking.entertainer_id, dateStr)

  return {
    'unavailable-warning': !isAvailable
  }
}

function isAvailableOnDate(entertainerId, dateStr) {
  return localAvailability.value.some(
    a => a.entertainer_id === entertainerId && a.available_date === dateStr
  )
}

function getReversedAbbreviation(area) {
  const abbr = area.abbreviation || area.name.substring(0, 3).toUpperCase()
  return abbr.split('').reverse()
}

// Drag and Drop
function handleDragStart(event, entertainer) {
  draggedEntertainer.value = entertainer
  event.dataTransfer.effectAllowed = 'move'
  event.target.style.opacity = '0.5'
}

function handleDragEnd(event) {
  draggedEntertainer.value = null
  dragOverTarget.value = null
  event.target.style.opacity = '1'
}

function handleDragEnter(event, areaId, day) {
  event.preventDefault()
  selectedDate.value = formatDate(day)
  dragOverTarget.value = `${areaId}-${day}`
}

function handleDragLeave(event) {
  // Only clear if we're leaving the drop zone entirely
  const relatedTarget = event.relatedTarget
  if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
    if (dragOverTarget.value === `${event.currentTarget.dataset.areaId}-${event.currentTarget.dataset.day}`) {
      dragOverTarget.value = null
    }
  }
}

async function handleDrop(event, areaId, day) {
  event.preventDefault()
  dragOverTarget.value = null

  if (!draggedEntertainer.value) return

  const bookingDate = formatDate(day)
  const entertainerId = draggedEntertainer.value.id

  // Get default emoji from area rules
  const defaultEmoji = areaRulesStore.getDefaultEmoji(areaId, bookingDate)

  // Save scroll position before reloading
  const calendarSection = document.querySelector('.calendar-section')
  const scrollTop = calendarSection ? calendarSection.scrollTop : 0

  try {
    const result = await bookingStore.createBooking({
      entertainerId,
      areaId,
      bookingDate,
      emoji: defaultEmoji
    })

    if (!result.success) {
      // Hard conflicts - booking was not created
      conflicts.value = result.conflicts || []
      warnings.value = result.warnings || []
      showConflictModal.value = true
    } else {
      // Success - reload bookings to show the new one
      await loadBookings()

      // Restore scroll position after DOM updates
      await new Promise(resolve => setTimeout(resolve, 0))
      if (calendarSection) {
        calendarSection.scrollTop = scrollTop
      }

      // Show warnings (e.g., act unavailable) but booking was created
      if (result.warnings && result.warnings.length > 0) {
        warnings.value = result.warnings
        conflicts.value = []
        showConflictModal.value = true
      }
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    conflicts.value = [{ message: 'An error occurred while creating the booking' }]
    warnings.value = []
    showConflictModal.value = true
  } finally {
    draggedEntertainer.value = null
  }
}

// Actions
function openBookingEditModal(booking) {
  selectedBooking.value = booking
  showBookingEditModal.value = true
}

function closeBookingEditModal() {
  showBookingEditModal.value = false
  selectedBooking.value = null
}

async function handleBookingSave(updates) {
  if (!selectedBooking.value) return

  // Save scroll position before reloading
  const calendarSection = document.querySelector('.calendar-section')
  const scrollTop = calendarSection ? calendarSection.scrollTop : 0

  try {
    await bookingStore.updateBooking(selectedBooking.value.id, updates)
    await loadBookings()

    // Restore scroll position after DOM updates
    await new Promise(resolve => setTimeout(resolve, 0))
    if (calendarSection) {
      calendarSection.scrollTop = scrollTop
    }

    closeBookingEditModal()
  } catch (error) {
    console.error('Error updating booking:', error)
    alert('Failed to update booking')
  }
}

async function handleBookingDelete() {
  if (!selectedBooking.value) return

  // Save scroll position before reloading
  const calendarSection = document.querySelector('.calendar-section')
  const scrollTop = calendarSection ? calendarSection.scrollTop : 0

  await bookingStore.deleteBooking(selectedBooking.value.id)
  await loadBookings()

  // Restore scroll position after DOM updates
  await new Promise(resolve => setTimeout(resolve, 0))
  if (calendarSection) {
    calendarSection.scrollTop = scrollTop
  }

  closeBookingEditModal()
}

async function confirmDeleteBooking(booking) {
  if (confirm('Are you sure you want to cancel this booking?')) {
    // Save scroll position before reloading
    const calendarSection = document.querySelector('.calendar-section')
    const scrollTop = calendarSection ? calendarSection.scrollTop : 0

    await bookingStore.deleteBooking(booking.id)
    await loadBookings()

    // Restore scroll position after DOM updates
    await new Promise(resolve => setTimeout(resolve, 0))
    if (calendarSection) {
      calendarSection.scrollTop = scrollTop
    }
  }
}

function closeConflictModal() {
  showConflictModal.value = false
  conflicts.value = []
  warnings.value = []
}

// Navigation
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

// Export to Image
async function exportToImage() {
  isExporting.value = true

  try {
    const calendarElement = document.querySelector('.calendar-grid')
    if (!calendarElement) {
      console.error('Calendar element not found')
      return
    }

    // Save original styles
    const originalStyles = {
      width: calendarElement.style.width,
      minWidth: calendarElement.style.minWidth,
      maxWidth: calendarElement.style.maxWidth,
      transform: calendarElement.style.transform
    }

    // Force fixed dimensions for consistent export
    calendarElement.style.width = '1920px'
    calendarElement.style.minWidth = '1920px'
    calendarElement.style.maxWidth = '1920px'
    calendarElement.style.transform = 'scale(1)'

    // Wait for reflow
    await new Promise(resolve => setTimeout(resolve, 100))

    // Capture with high resolution
    const canvas = await html2canvas(calendarElement, {
      scale: 2,
      width: 1920,
      windowWidth: 1920,
      backgroundColor: '#ffffff',
      logging: false
    })

    // Restore original styles
    Object.assign(calendarElement.style, originalStyles)

    // Download image
    canvas.toBlob(blob => {
      if (!blob) {
        console.error('Failed to create image blob')
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const filename = `schedule-${monthName.value.toLowerCase()}-${currentYear.value}.png`
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (error) {
    console.error('Error exporting calendar:', error)
    alert('Failed to export calendar. Please try again.')
  } finally {
    isExporting.value = false
  }
}

// Data Loading
async function loadBookings() {
  loading.value = true
  try {
    await bookingStore.fetchBookingsForMonth(currentYear.value, currentMonth.value)
    localBookings.value = [...bookingStore.bookings]
  } catch (error) {
    console.error('Failed to load bookings:', error)
  } finally {
    loading.value = false
  }
}

async function loadEntertainers() {
  try {
    await userStore.fetchAll()
  } catch (error) {
    console.error('Failed to load acts:', error)
  }
}

async function loadAreas() {
  try {
    await areaStore.fetchAll()
  } catch (error) {
    console.error('Failed to load areas:', error)
  }
}

async function loadAvailability() {
  try {
    const startDate = formatDate(1)
    const lastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
    const endDate = formatDate(lastDay)

    await availabilityStore.fetchAllAvailability({ startDate, endDate })
    localAvailability.value = [...availabilityStore.availability]
  } catch (error) {
    console.error('Failed to load availability:', error)
  }
}

// Watchers
watch([currentYear, currentMonth], async () => {
  await Promise.all([loadBookings(), loadAvailability()])
})

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadBookings(),
    loadEntertainers(),
    loadAreas(),
    loadAvailability(),
    areaRulesStore.fetchAllRules()
  ])
})
</script>

<style scoped>
.schedule-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.month-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.nav-right {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f5f5f5;
  border-color: #2196F3;
}

.export-btn {
  padding: 0.5rem 1rem;
  background: #2196F3;
  color: white;
  border: 1px solid #2196F3;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  font-weight: 500;
}

.export-btn:hover:not(:disabled) {
  background: #1976D2;
  border-color: #1976D2;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.schedule-layout {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  overflow: hidden;
}

.calendar-section {
  flex: 1;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.weekday-header {
  text-align: center;
  font-weight: 600;
  padding: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.calendar-day:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-day.empty {
  background: #f8f9fa;
  border-color: transparent;
}

.calendar-day.is-today {
  border-color: #2196F3;
  border-width: 2px;
}

.day-header {
  padding: 0.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  text-align: center;
}

.day-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.area-sections {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.area-section {
  flex: 1;
  border-bottom: 1px solid #e9ecef;
  padding: 0.25rem;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  position: relative;
  min-height: 28px;
  gap: 0.25rem;
  transition: all 0.2s;
}

.area-section:last-child {
  border-bottom: none;
}

.area-section.drag-over {
  background: #e3f2fd;
  border: 2px dashed #2196F3;
  border-radius: 4px;
}

.area-abbreviation {
  font-size: 0.65rem;
  font-weight: 700;
  color: #6c757d;
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.2rem;
  min-width: 14px;
  background: #f8f9fa;
  border-radius: 2px;
  flex-shrink: 0;
  cursor: help;
  line-height: 1;
}

.abbr-char {
  display: block;
  line-height: 0.8;
  margin: 0;
  transform: rotate(270deg);
  transform-origin: center center;
}

.booking {
  flex: 1;
  background: white;
  color: #333;
  border: 2px solid #4CAF50;
  border-radius: 3px;
  padding: 0.25rem 0.4rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 24px;
}

.booking:hover {
  border-color: #45a049;
  background: #f1f8f4;
  transform: translateY(-1px);
}

.booking.unavailable-warning {
  border-color: #FF9800;
  color: #333;
}

.booking-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  overflow: hidden;
  flex: 1;
}

.booking-emoji {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.booking-name {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.delete-btn {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  margin-left: 0.25rem;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: rgba(0, 0, 0, 0.4);
}

.drop-zone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed transparent;
  border-radius: 3px;
  transition: all 0.2s;
  min-height: 24px;
}

.area-section:hover .drop-zone {
  border-color: #dee2e6;
  background: #f8f9fa;
}

.drop-hint {
  color: #adb5bd;
  font-size: 1rem;
}

/* Acts Sidebar */
.entertainers-sidebar {
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.entertainers-sidebar h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #333;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #2196F3;
}

.entertainers-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.entertainer-card {
  padding: 0.75rem;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  user-select: none;
}

.entertainer-card:hover {
  background: white;
  border-color: #2196F3;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.1);
}

.entertainer-card:active {
  cursor: grabbing;
}

.entertainer-card .entertainer-name {
  font-weight: 500;
  color: #333;
}

.availability-badge {
  font-size: 1.1rem;
  color: #adb5bd;
}

.availability-badge.available {
  color: #4CAF50;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #d32f2f;
}

.conflicts-section,
.warnings-section {
  margin-bottom: 1rem;
}

.conflict-message,
.warning-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  border-radius: 4px;
}

.conflict-message {
  background: #ffebee;
  border-left-color: #d32f2f;
}

.conflict-icon,
.warning-icon {
  font-size: 1.2rem;
}

.modal-content p {
  margin: 0;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-close {
  padding: 0.5rem 1.5rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #1976D2;
}
</style>
