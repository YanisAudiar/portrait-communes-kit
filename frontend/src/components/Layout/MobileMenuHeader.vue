<template>
  <div class="menu-header">
    <div class="menu-brand">
      <div class="menu-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <span class="menu-title">Portrait Communes</span>
    </div>
    <button type="button" class="close-btn" @click="$emit('close')" aria-label="Fermer le menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'close'): void }>()
</script>

<style scoped>
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #1e2972 0%, #316d7b 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.02em;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}
</style>
