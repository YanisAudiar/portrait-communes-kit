<template>
  <router-link
    v-if="to"
    :to="to"
    class="nav-item"
    :class="{ active, 'nav-item-primary': isPrimary }"
  >
    <div class="nav-icon" :class="{ 'nav-icon-primary': isPrimary }">
      <slot name="icon" />
    </div>
    <span class="nav-label">{{ label }}</span>
  </router-link>
  <button
    v-else
    type="button"
    class="nav-item"
    :class="{ active, 'nav-item-primary': isPrimary }"
    @click="$emit('click')"
  >
    <div class="nav-icon" :class="{ 'nav-icon-primary': isPrimary }">
      <slot name="icon" />
    </div>
    <span class="nav-label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string
    active?: boolean
    isPrimary?: boolean
    label: string
  }>(),
  { active: false, isPrimary: false }
)

defineEmits<{ (e: 'click'): void }>()
</script>

<style scoped>
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  text-decoration: none;
  min-width: 56px;
  flex: 1;
  max-width: 80px;
  -webkit-tap-highlight-color: transparent;
}

.nav-item:active {
  transform: scale(0.95);
  background: rgba(0, 0, 0, 0.05);
}

.nav-item.active {
  color: var(--primary-blue, #1e2972);
}

.nav-item.active .nav-icon {
  background: rgba(30, 41, 114, 0.1);
}

.nav-item-primary {
  position: relative;
}

.nav-icon-primary {
  background: linear-gradient(135deg, var(--primary-blue, #1e2972) 0%, #316d7b 100%) !important;
  color: white !important;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(30, 41, 114, 0.3);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: transparent;
  transition: background 0.2s ease;
}

.nav-label {
  font-size: 10px;
  letter-spacing: 0.3px;
}

/* Très petits écrans : icônes et libellés plus compacts, toujours lisibles */
@media (max-width: 360px) {
  .nav-item {
    padding: 6px 4px;
    min-width: 0;
    max-width: none;
  }

  .nav-icon {
    width: 36px;
    height: 36px;
  }

  .nav-icon-primary {
    padding: 8px;
  }

  .nav-label {
    font-size: 9px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}
</style>
