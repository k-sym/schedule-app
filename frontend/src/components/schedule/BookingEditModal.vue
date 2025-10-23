<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <h2>Edit Booking</h2>

      <div class="booking-info">
        <div class="info-row">
          <strong>Act:</strong> {{ booking?.entertainer?.name }}
        </div>
        <div class="info-row">
          <strong>Area:</strong> {{ booking?.area?.name }}
        </div>
        <div class="info-row">
          <strong>Date:</strong> {{ formatDate(booking?.booking_date) }}
        </div>
      </div>

      <!-- Emoji Selector -->
      <div class="form-group">
        <label>Display Emoji</label>
        <div class="emoji-selector">
          <button
            v-for="preset in PRESET_EMOJIS"
            :key="preset.emoji"
            type="button"
            class="emoji-btn"
            :class="{ active: localEmoji === preset.emoji }"
            @click="localEmoji = preset.emoji"
            :title="preset.label"
          >
            {{ preset.emoji }}
          </button>
          <button
            type="button"
            class="emoji-btn clear-btn"
            :class="{ active: localEmoji === null }"
            @click="localEmoji = null"
            title="Clear emoji"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Display Note -->
      <div class="form-group">
        <label for="display-note">Display Note (replaces act name)</label>
        <textarea
          id="display-note"
          v-model="localDisplayNote"
          placeholder="Optional note to display instead of act name"
          rows="3"
          maxlength="255"
        ></textarea>
        <div class="char-count">{{ displayNoteLength }}/255</div>
      </div>

      <!-- Preview -->
      <div class="form-group">
        <label>Preview</label>
        <div class="preview-box">
          <span v-if="localEmoji" class="preview-emoji">{{ localEmoji }}</span>
          <span class="preview-text">{{ previewText }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button @click="handleDelete" class="btn-delete">Delete Booking</button>
        <div class="right-actions">
          <button @click="handleCancel" class="btn-cancel">Cancel</button>
          <button @click="handleSave" class="btn-save" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { PRESET_EMOJIS } from '@/constants/emojis'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save', 'delete'])

// Local state
const localEmoji = ref(null)
const localDisplayNote = ref('')
const saving = ref(false)

// Computed
const displayNoteLength = computed(() => {
  return localDisplayNote.value ? localDisplayNote.value.length : 0
})

const previewText = computed(() => {
  if (localDisplayNote.value) {
    return localDisplayNote.value
  }
  return props.booking?.entertainer?.name || 'Act Name'
})

// Methods
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function handleOverlayClick() {
  handleCancel()
}

function handleCancel() {
  emit('close')
}

async function handleSave() {
  saving.value = true
  try {
    await emit('save', {
      emoji: localEmoji.value,
      display_note: localDisplayNote.value || null
    })
  } finally {
    saving.value = false
  }
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this booking?')) {
    emit('delete')
  }
}

// Watch for booking changes to update local state
watch(
  () => props.booking,
  (newBooking) => {
    if (newBooking) {
      localEmoji.value = newBooking.emoji || null
      localDisplayNote.value = newBooking.display_note || ''
    } else {
      localEmoji.value = null
      localDisplayNote.value = ''
    }
  },
  { immediate: true }
)
</script>

<style scoped>
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.booking-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.info-row {
  padding: 0.25rem 0;
  color: #495057;
}

.info-row strong {
  color: #212529;
  margin-right: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.emoji-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.emoji-btn {
  width: 48px;
  height: 48px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 6px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover {
  border-color: #2196F3;
  background: #f8f9fa;
}

.emoji-btn.active {
  border-color: #2196F3;
  background: #e3f2fd;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.emoji-btn.clear-btn {
  font-size: 1.2rem;
  color: #6c757d;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.char-count {
  text-align: right;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.preview-box {
  background: #4CAF50;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.preview-emoji {
  font-size: 1.2rem;
}

.preview-text {
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #dee2e6;
}

.right-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-delete {
  padding: 0.5rem 1.25rem;
  background: white;
  color: #d32f2f;
  border: 1px solid #d32f2f;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #d32f2f;
  color: white;
}

.btn-cancel {
  padding: 0.5rem 1.25rem;
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-save {
  padding: 0.5rem 1.5rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #1976D2;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
