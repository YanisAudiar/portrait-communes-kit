<template>
  <div class="sidebar-header">
    <div class="header-icon">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
      </svg>
    </div>
    <h3 class="title-b">{{ title }}</h3>
    <button 
      v-if="showToggle"
      @click="$emit('toggle')" 
      class="legend-toggle show-mobile"
      :title="isCollapsed ? 'Afficher' : 'Masquer'"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path v-if="isCollapsed" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        <path v-else d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'Légende'
  },
  showToggle: {
    type: Boolean,
    default: false
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid transparent;
  background: linear-gradient(90deg, #1e2972 0%, transparent 100%) left bottom no-repeat;
  background-size: 100% 2px;
  position: relative;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1e2972 0%, #316d7b 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(30, 41, 114, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-icon:hover {
  transform: rotate(-10deg) scale(1.1);
  box-shadow: 0 6px 20px rgba(30, 41, 114, 0.3);
}

.legend-toggle {
  display: none;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: var(--accent-orange);
  color: white;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
  justify-content: center;
}

.legend-toggle:hover {
  background: var(--link-hover);
  transform: translateY(-50%) scale(1.05);
}

@media (max-width: 768px) {
  .legend-toggle {
    display: flex;
  }
  
  .sidebar-header {
    margin-bottom: 16px;
  }
}
</style>

