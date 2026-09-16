<template>
  <div class="export-menu">
    <div class="menu-header">
      <h4 class="menu-title">Options d'export PDF</h4>
      <button class="menu-close" @click="$emit('close')" type="button">×</button>
    </div>

    <div class="menu-options">
      <button
        class="menu-option"
        type="button"
        @click="$emit('export-current-theme')"
        :disabled="!activeThemeId || isExporting"
      >
        <span class="option-icon">📊</span>
        <div class="option-content">
          <span class="option-label">Thématique actuelle</span>
          <span class="option-description">
            {{ activeThemeName || 'Sélectionnez une thématique' }}
          </span>
        </div>
      </button>

      <button
        class="menu-option"
        type="button"
        @click="$emit('export-all-themes')"
        :disabled="isExporting"
      >
        <span class="option-icon">📚</span>
        <div class="option-content">
          <span class="option-label">Toutes les thématiques</span>
          <span class="option-description">Export complet de la commune</span>
        </div>
      </button>
    </div>

    <div v-if="isExporting" class="export-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: exportProgress + '%' }"></div>
      </div>
      <p class="progress-text">{{ exportProgress }}%</p>
    </div>

    <div v-if="exportError" class="export-error">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ exportError }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeThemeId: string | null
  activeThemeName: string | null
  isExporting: boolean
  exportProgress: number
  /** Message d'erreur (vide si pas d'erreur) */
  exportError: string | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'export-current-theme'): void
  (e: 'export-all-themes'): void
}>()
</script>

<style scoped>
.export-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 5200;
  overflow: hidden;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e0e0e0;
}

.menu-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.menu-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.menu-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #2c3e50;
}

.menu-options {
  padding: 12px;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  text-align: left;
}

.menu-option:last-child {
  margin-bottom: 0;
}

.menu-option:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #316d7b;
  transform: translateX(4px);
}

.menu-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.option-label {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.option-description {
  font-size: 12px;
  color: #666;
}

.export-progress {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #316d7b 0%, #4a8a9a 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 12px;
  color: #666;
  text-align: center;
  margin: 0;
}

.export-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff3cd;
  border-top: 1px solid #ffc107;
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.error-text {
  font-size: 12px;
  color: #856404;
}

@media (max-width: 768px) {
  .export-menu {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    min-width: 280px;
  }
}
</style>
