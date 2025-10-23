<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-main">
      <AppSidebar />
      <main class="dashboard-content">
        <div class="content-header">
          <h1>My Profile</h1>
        </div>

        <div class="content-body">
          <div class="profile-grid">
            <!-- Profile Information Card -->
            <div class="card">
              <div class="card-header">
                <h2>Profile Information</h2>
                <button class="btn-secondary" @click="showEditModal = true">
                  Edit
                </button>
              </div>
              <div class="card-body">
                <div class="info-row">
                  <span class="label">Name</span>
                  <span class="value">{{ user?.first_name }} {{ user?.last_name }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email</span>
                  <span class="value">{{ user?.email }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Role</span>
                  <span class="value">
                    <span :class="['badge', `badge-${user?.role}`]">
                      {{ user?.role }}
                    </span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">Phone</span>
                  <span class="value">{{ user?.phone || 'Not set' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Status</span>
                  <span class="value">
                    <span :class="['status', user?.is_active ? 'status-active' : 'status-inactive']">
                      {{ user?.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Change Password Card -->
            <div class="card">
              <div class="card-header">
                <h2>Change Password</h2>
              </div>
              <div class="card-body">
                <form @submit.prevent="handleChangePassword">
                  <div class="form-group">
                    <label>Current Password</label>
                    <input
                      v-model="passwordForm.currentPassword"
                      type="password"
                      required
                      autocomplete="current-password"
                    />
                  </div>

                  <div class="form-group">
                    <label>New Password</label>
                    <input
                      v-model="passwordForm.newPassword"
                      type="password"
                      required
                      minlength="8"
                      autocomplete="new-password"
                    />
                    <small>Min 8 characters, 1 uppercase, 1 lowercase, 1 number</small>
                  </div>

                  <div class="form-group">
                    <label>Confirm New Password</label>
                    <input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      required
                      minlength="8"
                      autocomplete="new-password"
                    />
                  </div>

                  <button
                    type="submit"
                    class="btn-primary"
                    :disabled="changingPassword"
                  >
                    {{ changingPassword ? 'Changing...' : 'Change Password' }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Edit Profile</h2>
          <button class="btn-close" @click="showEditModal = false">×</button>
        </div>
        <form @submit.prevent="handleUpdateProfile" class="modal-body">
          <div class="form-group">
            <label>First Name *</label>
            <input
              v-model="profileForm.first_name"
              type="text"
              required
              maxlength="50"
            />
          </div>

          <div class="form-group">
            <label>Last Name *</label>
            <input
              v-model="profileForm.last_name"
              type="text"
              required
              maxlength="50"
            />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input
              v-model="profileForm.email"
              type="email"
              required
            />
          </div>

          <div class="form-group">
            <label>Phone</label>
            <input
              v-model="profileForm.phone"
              type="tel"
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showEditModal = false">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="updatingProfile">
              {{ updatingProfile ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api/auth'
import { usersAPI } from '@/api/users'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const { success, error } = useToast()

const user = computed(() => authStore.user)

const showEditModal = ref(false)
const updatingProfile = ref(false)
const changingPassword = ref(false)

const profileForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Watch user changes to update form
watch(user, (newUser) => {
  if (newUser) {
    profileForm.value = {
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      phone: newUser.phone || ''
    }
  }
}, { immediate: true })

async function handleUpdateProfile() {
  updatingProfile.value = true
  try {
    const response = await usersAPI.update(user.value.id, profileForm.value)

    // Update auth store with new user data
    authStore.user = response.data

    success('Profile updated successfully')
    showEditModal.value = false
  } catch (err) {
    error(err.response?.data?.error || 'Failed to update profile')
  } finally {
    updatingProfile.value = false
  }
}

async function handleChangePassword() {
  // Validate password match
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error('New passwords do not match')
    return
  }

  // Validate password strength (basic)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  if (!passwordRegex.test(passwordForm.value.newPassword)) {
    error('Password must contain at least 1 uppercase, 1 lowercase, and 1 number')
    return
  }

  changingPassword.value = true
  try {
    await authAPI.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )

    success('Password changed successfully')

    // Reset form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (err) {
    error(err.response?.data?.error || 'Failed to change password')
  } finally {
    changingPassword.value = false
  }
}
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

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  max-width: 1200px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.card-header h2 {
  margin: 0;
  font-size: 1.125rem;
  color: #111827;
}

.card-body {
  padding: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.info-row .value {
  font-size: 0.875rem;
  color: #111827;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-admin {
  background: #fee2e2;
  color: #991b1b;
}

.badge-entertainer {
  background: #dbeafe;
  color: #1e40af;
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

.form-group input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
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
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
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
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}
</style>
