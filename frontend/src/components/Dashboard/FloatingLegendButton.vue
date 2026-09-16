<template>
  <button 
    v-if="isLegendCollapsed" 
    @click="$emit('toggle')" 
    class="floating-legend-btn show-mobile"
    title="Afficher la légende"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
    </svg>
    <span>Légende</span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  isLegendCollapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<style scoped>
.floating-legend-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--accent-orange);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(241, 126, 8, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
}

.floating-legend-btn:hover {
  background: var(--link-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(241, 126, 8, 0.4);
}

.show-mobile {
  display: none;
}

@media (max-width: 768px) {
  .show-mobile {
    display: flex;
  }
}
</style>
