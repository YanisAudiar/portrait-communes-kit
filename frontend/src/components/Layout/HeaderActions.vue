<template>
  <div class="header-actions">
    <button @click="onInfoClick" class="action-btn" title="Informations">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
      </svg>
    </button>
    <button @click="onSettingsClick" class="action-btn" title="Paramètres">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
      </svg>
    </button>
    <button @click="onMenuClick" class="mobile-menu-btn show-mobile" title="Menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'info-click'): void
  (e: 'settings-click'): void
  (e: 'menu-click'): void
}>()

const onInfoClick = (): void => {
  emit('info-click')
}

const onSettingsClick = (): void => {
  emit('settings-click')
}

const onMenuClick = (): void => {
  emit('menu-click')
}
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.action-btn:hover {
  background: linear-gradient(135deg, #f17e08 0%, #e36411 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 4px 12px rgba(241, 126, 8, 0.25),
    0 8px 20px rgba(241, 126, 8, 0.15);
}

.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #1e2972 0%, #316d7b 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(30, 41, 114, 0.2);
}

.mobile-menu-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 16px rgba(30, 41, 114, 0.3);
}

.mobile-menu-btn:active {
  transform: translateY(0) scale(0.98);
}

.mobile-menu-btn svg {
  fill: none;
}

/* Sur mobile : tout est dans la barre du bas (Menu + Export), on cache le hamburger */
@media (max-width: 768px) {
  .action-btn {
    display: none;
  }

  .mobile-menu-btn {
    display: none; /* Menu ouvert uniquement via la barre du bas */
  }
}
</style>

