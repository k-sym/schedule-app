<template>
  <div class="dashboard-layout">
    <AppHeader />
    <main class="dashboard-content">
        <div class="content-header">
          <h1>Area Management</h1>
          <button class="btn-primary" @click="showCreateModal = true">
            + Create Area
          </button>
        </div>

        <div class="content-body">
          <div class="areas-grid">
            <div
              v-for="area in sortedAreas"
              :key="area.id"
              class="area-card"
            >
              <div class="area-card-header">
                <h3>{{ area.name }}</h3>
                <div class="area-actions">
                  <button class="btn-icon" @click="editArea(area)" title="Edit">
                    ✏️
                  </button>
                  <button
                    class="btn-icon"
                    @click="confirmDelete(area)"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div class="area-card-body">
                <div class="area-info">
                  <span class="info-label">Display Order:</span>
                  <span class="info-value">{{ area.display_order }}</span>
                </div>

                <div class="area-info" v-if="area.capacity">
                  <span class="info-label">Capacity:</span>
                  <span class="info-value">{{ area.capacity }} people</span>
                </div>

                <div class="area-info" v-if="area.operating_hours && Object.keys(area.operating_hours).length > 0">
                  <span class="info-label">Operating Hours:</span>
                  <div class="operating-hours">
                    <template v-for="(hours, day) in area.operating_hours" :key="day">
                      <div v-if="hours && hours.open && hours.close" class="hours-row">
                        <span class="day-name">{{ capitalize(day) }}:</span>
                        <span class="hours-time">{{ hours.open }} - {{ hours.close }}</span>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="area-info" v-if="area.notes">
                  <span class="info-label">Notes:</span>
                  <p class="info-value">{{ area.notes }}</p>
                </div>

                <div class="area-status">
                  <span :class="['status', area.is_active ? 'status-active' : 'status-inactive']">
                    {{ area.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="!loading && areas.length === 0" class="empty">
              No areas found. Create your first area!
            </div>
          </div>

          <div v-if="loading" class="loading">Loading areas...</div>
        </div>
      </main>

    <!-- Create/Edit Area Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal modal-large" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Edit Area' : 'Create New Area' }}</h2>
          <button class="btn-close" @click="closeModals">×</button>
        </div>
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Name *</label>
              <input
                v-model="formData.name"
                type="text"
                required
                maxlength="100"
              />
            </div>

            <div class="form-group">
              <label>Display Order *</label>
              <input
                v-model.number="formData.display_order"
                type="number"
                required
                min="0"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Capacity</label>
              <input
                v-model.number="formData.capacity"
                type="number"
                min="1"
              />
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="formData.is_active">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea
              v-model="formData.notes"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Operating Hours</label>
            <div class="operating-hours-editor">
              <div v-for="day in daysOfWeek" :key="day" class="hours-editor-row">
                <label class="day-checkbox">
                  <input
                    type="checkbox"
                    :checked="formData.operating_hours[day]"
                    @change="toggleDay(day)"
                  />
                  <span>{{ capitalize(day) }}</span>
                </label>
                <div v-if="formData.operating_hours[day]" class="time-inputs">
                  <input
                    v-model="formData.operating_hours[day].open"
                    type="time"
                    required
                  />
                  <span>to</span>
                  <input
                    v-model="formData.operating_hours[day].close"
                    type="time"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModals">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal modal-small" @click.stop>
        <div class="modal-header">
          <h2>Confirm Deletion</h2>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ areaToDelete?.name }}</strong>?</p>
          <p class="warning">This will deactivate the area.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteModal = false">
            Cancel
          </button>
          <button class="btn-danger" @click="handleDelete">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useAreasStore } from '@/stores/areas'
import { useToast } from '@/composables/useToast'

const areasStore = useAreasStore()
const { success, error } = useToast()

const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const areaToDelete = ref(null)
const editingAreaId = ref(null)

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const formData = ref({
  name: '',
  display_order: 0,
  operating_hours: {},
  capacity: null,
  notes: '',
  is_active: true
})

const areas = computed(() => areasStore.areas)
const sortedAreas = computed(() => {
  return [...areas.value].sort((a, b) => a.display_order - b.display_order)
})

onMounted(async () => {
  await fetchAreas()
})

async function fetchAreas() {
  loading.value = true
  try {
    await areasStore.fetchAll({ include_inactive: true })
  } catch (err) {
    error('Failed to load areas')
  } finally {
    loading.value = false
  }
}

function editArea(area) {
  editingAreaId.value = area.id
  formData.value = {
    name: area.name,
    display_order: area.display_order,
    operating_hours: area.operating_hours ? JSON.parse(JSON.stringify(area.operating_hours)) : {},
    capacity: area.capacity,
    notes: area.notes || '',
    is_active: area.is_active
  }
  showEditModal.value = true
}

function confirmDelete(area) {
  areaToDelete.value = area
  showDeleteModal.value = true
}

async function handleDelete() {
  try {
    await areasStore.deleteArea(areaToDelete.value.id)
    success('Area deleted successfully')
    showDeleteModal.value = false
    areaToDelete.value = null
  } catch (err) {
    error(err.response?.data?.error || 'Failed to delete area')
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    // Clean up operating_hours - remove null entries
    const cleanedHours = {}
    Object.keys(formData.value.operating_hours).forEach(day => {
      if (formData.value.operating_hours[day]) {
        cleanedHours[day] = formData.value.operating_hours[day]
      }
    })

    const submitData = {
      ...formData.value,
      operating_hours: Object.keys(cleanedHours).length > 0 ? cleanedHours : null
    }

    if (showEditModal.value) {
      await areasStore.updateArea(editingAreaId.value, submitData)
      success('Area updated successfully')
    } else {
      await areasStore.createArea(submitData)
      success('Area created successfully')
    }
    closeModals()
  } catch (err) {
    error(err.response?.data?.error || 'Failed to save area')
  } finally {
    submitting.value = false
  }
}

function toggleDay(day) {
  if (formData.value.operating_hours[day]) {
    delete formData.value.operating_hours[day]
  } else {
    formData.value.operating_hours[day] = { open: '18:00', close: '02:00' }
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  editingAreaId.value = null
  formData.value = {
    name: '',
    display_order: 0,
    operating_hours: {},
    capacity: null,
    notes: '',
    is_active: true
  }
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h1 {
  margin: 0;
  font-size: 1.875rem;
  color: #111827;
}

.content-body {
  padding: 2rem;
}

.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.area-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.area-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.area-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.area-card-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #111827;
}

.area-actions {
  display: flex;
  gap: 0.5rem;
}

.area-card-body {
  padding: 1.25rem;
}

.area-info {
  margin-bottom: 1rem;
}

.area-info:last-child {
  margin-bottom: 0;
}

.info-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
}

.operating-hours {
  margin-top: 0.5rem;
}

.hours-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.day-name {
  color: #6b7280;
  min-width: 100px;
}

.hours-time {
  color: #111827;
}

.area-status {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
}

.btn-icon:hover {
  transform: scale(1.2);
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
}

.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Modal styles */
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

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small {
  max-width: 400px;
}

.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 0.5rem;
  color: #6b7280;
}

.modal-body .warning {
  color: #dc2626;
  font-weight: 500;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.operating-hours-editor {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 1rem;
}

.hours-editor-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.hours-editor-row:last-child {
  margin-bottom: 0;
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  cursor: pointer;
}

.day-checkbox input[type="checkbox"] {
  width: auto;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.time-inputs input {
  width: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}
</style>
