<template>
  <div class="dashboard-layout">
    <AppHeader />
    <div class="dashboard-main">
      <AppSidebar />
      <main class="dashboard-content">
        <div class="content-header">
          <h1>User Management</h1>
          <button class="btn-primary" @click="showCreateModal = true">
            + Create User
          </button>
        </div>

        <div class="content-body">
          <div class="filters">
            <select v-model="roleFilter" class="filter-select">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="entertainer">Entertainer</option>
            </select>
            <select v-model="statusFilter" class="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="users-table-container">
            <table class="users-table" v-if="!loading">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="['badge', `badge-${user.role}`]">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ user.phone || '-' }}</td>
                  <td>
                    <span :class="['status', user.is_active ? 'status-active' : 'status-inactive']">
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        class="btn-icon"
                        @click="editUser(user)"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        v-if="user.is_active"
                        class="btn-icon"
                        @click="confirmDeactivate(user)"
                        title="Deactivate"
                        :disabled="user.id === currentUserId"
                      >
                        🚫
                      </button>
                      <button
                        v-else
                        class="btn-icon"
                        @click="handleReactivate(user.id)"
                        title="Reactivate"
                      >
                        ✅
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="loading" class="loading">Loading users...</div>
            <div v-if="!loading && filteredUsers.length === 0" class="empty">
              No users found.
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Edit User' : 'Create New User' }}</h2>
          <button class="btn-close" @click="closeModals">×</button>
        </div>
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label>Name *</label>
            <input
              v-model="formData.name"
              type="text"
              required
              maxlength="200"
              placeholder="Full name or stage/band name"
            />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input
              v-model="formData.email"
              type="email"
              required
            />
          </div>

          <div class="form-group" v-if="showCreateModal">
            <label>Password *</label>
            <input
              v-model="formData.password"
              type="password"
              required
              minlength="8"
            />
            <small>Min 8 characters, 1 uppercase, 1 lowercase, 1 number</small>
          </div>

          <div class="form-group">
            <label>Role *</label>
            <select v-model="formData.role" required>
              <option value="admin">Admin</option>
              <option value="entertainer">Entertainer</option>
            </select>
          </div>

          <div class="form-group">
            <label>Phone</label>
            <input
              v-model="formData.phone"
              type="tel"
            />
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

    <!-- Confirm Deactivate Modal -->
    <div v-if="showDeactivateModal" class="modal-overlay" @click="showDeactivateModal = false">
      <div class="modal modal-small" @click.stop>
        <div class="modal-header">
          <h2>Confirm Deactivation</h2>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to deactivate <strong>{{ userToDeactivate?.name }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeactivateModal = false">
            Cancel
          </button>
          <button class="btn-danger" @click="handleDeactivate">
            Deactivate
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const usersStore = useUsersStore()
const authStore = useAuthStore()
const { success, error } = useToast()

const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeactivateModal = ref(false)
const userToDeactivate = ref(null)
const editingUserId = ref(null)

const roleFilter = ref('')
const statusFilter = ref('')

const currentUserId = computed(() => authStore.user?.id)

const formData = ref({
  name: '',
  email: '',
  password: '',
  role: 'entertainer',
  phone: ''
})

const filteredUsers = computed(() => {
  let filtered = usersStore.users

  if (roleFilter.value) {
    filtered = filtered.filter(u => u.role === roleFilter.value)
  }

  if (statusFilter.value === 'active') {
    filtered = filtered.filter(u => u.is_active)
  } else if (statusFilter.value === 'inactive') {
    filtered = filtered.filter(u => !u.is_active)
  }

  return filtered
})

onMounted(async () => {
  await fetchUsers()
})

async function fetchUsers() {
  loading.value = true
  try {
    await usersStore.fetchAll()
  } catch (err) {
    error('Failed to load users')
  } finally {
    loading.value = false
  }
}

function editUser(user) {
  editingUserId.value = user.id
  formData.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || ''
  }
  showEditModal.value = true
}

function confirmDeactivate(user) {
  if (user.id === currentUserId.value) {
    error('You cannot deactivate your own account')
    return
  }
  userToDeactivate.value = user
  showDeactivateModal.value = true
}

async function handleDeactivate() {
  try {
    await usersStore.deactivateUser(userToDeactivate.value.id)
    success('User deactivated successfully')
    showDeactivateModal.value = false
    userToDeactivate.value = null
  } catch (err) {
    error(err.response?.data?.error || 'Failed to deactivate user')
  }
}

async function handleReactivate(userId) {
  try {
    await usersStore.reactivateUser(userId)
    success('User reactivated successfully')
  } catch (err) {
    error('Failed to reactivate user')
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (showEditModal.value) {
      // Edit existing user
      await usersStore.updateUser(editingUserId.value, formData.value)
      success('User updated successfully')
    } else {
      // Create new user
      await usersStore.createUser(formData.value)
      success('User created successfully')
    }
    closeModals()
  } catch (err) {
    error(err.response?.data?.error || 'Failed to save user')
  } finally {
    submitting.value = false
  }
}

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  editingUserId.value = null
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: 'entertainer',
    phone: ''
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

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.users-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #111827;
}

.users-table tbody tr:hover {
  background: #f9fafb;
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

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
}

.btn-icon:hover:not(:disabled) {
  transform: scale(1.2);
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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
  margin: 0;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus {
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}
</style>
