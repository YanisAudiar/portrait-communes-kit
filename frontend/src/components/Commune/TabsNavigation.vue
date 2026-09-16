<template>
  <div class="tabs-nav">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="$emit('tab-change', tab.id)"
      :class="['tab-button', { active: activeTab === tab.id }]"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id: string
  label: string
  icon?: string
  [key: string]: any
}

defineProps({
  tabs: {
    type: Array as () => Tab[],
    required: true
  },
  activeTab: {
    type: String,
    required: true
  }
})

defineEmits<{
  (e: 'tab-change', tabId: string): void
}>()
</script>

<style scoped>
.tabs-nav {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: #F5F7FA;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 12px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(229, 231, 235, 0.8);
  margin-bottom: 24px;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #616E7C;
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  white-space: nowrap;
}

.tab-button:hover {
  color: #323F4B;
}

.tab-button.active {
  background: white;
  color: #0A3D62;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.tab-icon {
  font-size: 20px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.tab-button:hover .tab-icon {
  transform: scale(1.15) translateY(-2px);
}

.tab-button.active .tab-icon {
  transform: scale(1.2);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.tab-label {
  font-size: 14px;
  line-height: 1.2;
}

@media (max-width: 1024px) {
  .tabs-nav {
    gap: 6px;
    padding: 6px;
  }

  .tab-button {
    padding: 12px 16px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .tabs-nav {
    gap: 4px;
    padding: 6px;
  }

  .tab-button {
    flex-direction: column;
    padding: 10px 12px;
    gap: 6px;
  }

  .tab-label {
    font-size: 12px;
  }

  .tab-icon {
    font-size: 18px;
  }
}
</style>
