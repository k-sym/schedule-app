<template>
  <div class="login-container">
    <div class="login-card card">
      <h1>Schedule App</h1>
      <p class="subtitle">Sign in to continue</p>
      <div style="margin-top: 2rem; text-align: center; color: var(--text-secondary);">
        Login form will be implemented in Phase 1
      </div>
    </div>
  </div>
</template>

<script setup>
// Login component will be implemented in Phase 1
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
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>
