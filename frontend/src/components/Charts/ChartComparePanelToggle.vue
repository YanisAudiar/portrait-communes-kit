<template>
  <button
    type="button"
    class="compare-toggle-btn"
    :class="{ 'is-open': isPanelOpen }"
    @click="$emit('toggle-panel')"
  >
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
    <span>Comparer</span>
    <svg
      class="chevron"
      :class="{ 'rotate-180': isPanelOpen }"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isPanelOpen: boolean
}>()

defineEmits<{
  (e: 'toggle-panel'): void
}>()
</script>

<style scoped>
.compare-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.compare-toggle-btn:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #cbd5e1;
  color: #1e40af;
}

.compare-toggle-btn.is-open {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
  color: #1e40af;
}

.compare-toggle-btn .icon {
  width: 16px;
  height: 16px;
}

.compare-toggle-btn .chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.compare-toggle-btn .chevron.rotate-180 {
  transform: rotate(180deg);
}
</style>
