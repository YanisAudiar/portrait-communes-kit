<template>
  <transition name="fade-slide" mode="out-in">
    <div v-if="isActive" :key="tabId" class="tab-panel">
      <slot />
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps({
  tabId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true
  }
})
</script>

<style scoped>
.tab-panel {
  height: 100%;
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>

