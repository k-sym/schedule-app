<template>
  <div class="schedule-layout">
    <AppHeader />
    <main class="schedule-content">
      <ScheduleCalendar />
    </main>
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar.vue'
</script>

<style scoped>
.schedule-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.schedule-content {
  flex: 1;
  padding: 1.5rem;
  overflow: hidden;
  background: #f5f5f5;
}
</style>
