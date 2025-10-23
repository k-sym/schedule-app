<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <h2>Area Rules: {{ area?.name }}</h2>
      <p class="description">Set default emojis for bookings based on day of the week</p>

      <!-- Existing Rules List -->
      <div v-if="rules.length > 0" class="rules-list">
        <h3>Current Rules</h3>
        <div
          v-for="rule in sortedRules"
          :key="rule.id"
          class="rule-item"
        >
          <div class="rule-info">
            <span class="rule-day">{{ getDayName(rule.day_of_week) }}</span>
            <span class="rule-emoji">{{ rule.default_emoji }}</span>
          </div>
          <button
            @click="handleDeleteRule(rule.id)"
            class="btn-delete-rule"
            title="Delete rule"
          >
            ✕
          </button>
        </div>
      </div>

      <div v-else class="no-rules">
        <p>No rules set for this area yet.</p>
      </div>

      <!-- Add New Rule Form -->
      <div class="add-rule-form">
        <h3>Add New Rule</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="day-select">Day of Week</label>
            <select id="day-select" v-model="newDayOfWeek" class="day-select">
              <option :value="null" disabled>Select a day</option>
              <option
                v-for="(day, index) in weekdays"
                :key="index"
                :value="index"
                :disabled="isDayUsed(index)"
              >
                {{ day }} {{ isDayUsed(index) ? '(already set)' : '' }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Default Emoji</label>
            <div class="emoji-selector">
              <button
                v-for="preset in PRESET_EMOJIS"
                :key="preset.emoji"
                type="button"
                class="emoji-btn"
                :class="{ active: newEmoji === preset.emoji }"
                @click="newEmoji = preset.emoji"
                :title="preset.label"
              >
                {{ preset.emoji }}
              </button>
            </div>
          </div>
        </div>

        <button
          @click="handleAddRule"
          class="btn-add"
          :disabled="!newDayOfWeek || !newEmoji || saving"
        >
          {{ saving ? 'Adding...' : 'Add Rule' }}
        </button>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button @click="handleClose" class="btn-close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAreaRulesStore } from '@/stores/areaRules'
import { PRESET_EMOJIS } from '@/constants/emojis'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  area: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const areaRulesStore = useAreaRulesStore()

// Local state
const newDayOfWeek = ref(null)
const newEmoji = ref(null)
const saving = ref(false)

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Computed
const rules = computed(() => {
  if (!props.area) return []
  return areaRulesStore.getRulesByAreaId(props.area.id)
})

const sortedRules = computed(() => {
  return [...rules.value].sort((a, b) => a.day_of_week - b.day_of_week)
})

// Methods
function getDayName(dayOfWeek) {
  return weekdays[dayOfWeek]
}

function isDayUsed(dayIndex) {
  return rules.value.some(r => r.day_of_week === dayIndex)
}

function handleOverlayClick() {
  handleClose()
}

function handleClose() {
  emit('close')
}

async function handleAddRule() {
  if (!newDayOfWeek.value === null || !newEmoji.value || !props.area) return

  saving.value = true
  try {
    await areaRulesStore.createRule(
      props.area.id,
      newDayOfWeek.value,
      newEmoji.value
    )

    // Reset form
    newDayOfWeek.value = null
    newEmoji.value = null
  } catch (error) {
    console.error('Error adding rule:', error)
    alert('Failed to add rule')
  } finally {
    saving.value = false
  }
}

async function handleDeleteRule(ruleId) {
  if (!confirm('Are you sure you want to delete this rule?')) return

  try {
    await areaRulesStore.removeRule(ruleId)
  } catch (error) {
    console.error('Error deleting rule:', error)
    alert('Failed to delete rule')
  }
}

// Watch for area changes to load rules
watch(
  () => props.area,
  async (newArea) => {
    if (newArea && props.isOpen) {
      try {
        await areaRulesStore.fetchRulesByArea(newArea.id)
      } catch (error) {
        console.error('Error loading area rules:', error)
      }
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
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.description {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
}

.rules-list {
  margin-bottom: 2rem;
}

.rules-list h3 {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  color: #495057;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.rule-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rule-day {
  font-weight: 600;
  color: #495057;
  min-width: 100px;
}

.rule-emoji {
  font-size: 1.5rem;
}

.btn-delete-rule {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6c757d;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.btn-delete-rule:hover {
  background: #d32f2f;
  border-color: #d32f2f;
  color: white;
}

.no-rules {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 2rem;
}

.no-rules p {
  margin: 0;
  color: #6c757d;
}

.add-rule-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.add-rule-form h3 {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  color: #495057;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.day-select {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
}

.day-select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.day-select option:disabled {
  color: #adb5bd;
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

.btn-add {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-add:hover:not(:disabled) {
  background: #1976D2;
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #dee2e6;
}

.btn-close {
  padding: 0.5rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
