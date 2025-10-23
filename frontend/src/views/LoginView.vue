<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Schedule App</h1>
      <p class="subtitle">Sign in to continue</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="admin@scheduleapp.com"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="demo-credentials">
        <p><strong>Demo Credentials:</strong></p>
        <p>Admin: admin@scheduleapp.com / admin123</p>
        <p>Act: entertainer@scheduleapp.com / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: showError } = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const response = await authAPI.login(email.value, password.value)

    // Store auth data (response is already unwrapped by authAPI)
    authStore.setAuth({
      user: response.user,
      token: response.accessToken,
      refreshToken: response.refreshToken
    })

    success(`Welcome, ${response.user.name}!`)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed. Please try again.'
    showError(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 1rem;
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #111827;
  font-size: 2rem;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.login-form {
  margin-top: 2rem;
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
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
}

.btn-login:hover:not(:disabled) {
  background: #2563eb;
}

.btn-login:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
}

.demo-credentials {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.demo-credentials p {
  margin: 0.25rem 0;
}

.demo-credentials strong {
  color: #111827;
}
</style>
