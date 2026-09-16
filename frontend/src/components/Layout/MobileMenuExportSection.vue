<template>
  <div class="menu-section">
    <span class="section-label">Exporter en PDF</span>
    <div v-if="isExporting" class="export-loading">
      <div class="export-loading-spinner"></div>
      <span class="export-loading-text">Génération du PDF en cours...</span>
    </div>
    <div class="menu-actions" :class="{ 'is-loading': isExporting }">
      <button
        type="button"
        class="action-btn"
        :class="{ 'action-btn-disabled': !activeThemeId || isExporting }"
        :disabled="!activeThemeId || isExporting"
        @click="handleExportCurrent"
      >
        <div class="nav-icon-wrapper nav-icon-export">
          <svg v-if="!isExporting" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <svg v-else class="spinner-icon" width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"></path>
          </svg>
        </div>
        <div class="action-content">
          <span class="action-label">Thématique actuelle</span>
          <span class="action-hint">{{ activeThemeName || 'Sélectionnez un thème' }}</span>
        </div>
      </button>
      <button
        type="button"
        class="action-btn action-btn-primary"
        :class="{ 'action-btn-disabled': isExporting }"
        :disabled="isExporting"
        @click="$emit('export-all-themes')"
      >
        <div class="nav-icon-wrapper nav-icon-export-all">
          <svg v-if="!isExporting" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <polyline points="9 15 12 12 15 15"></polyline>
          </svg>
          <svg v-else class="spinner-icon" width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"></path>
          </svg>
        </div>
        <div class="action-content">
          <span class="action-label">Toutes les thématiques</span>
          <span class="action-hint">{{ isExporting ? 'Veuillez patienter...' : 'Export complet de la commune' }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeThemeId: string | null
  activeThemeName: string | null
  isExporting: boolean
}>()

const emit = defineEmits<{
  (e: 'export-current-theme'): void
  (e: 'export-all-themes'): void
}>()

function handleExportCurrent() {
  emit('export-current-theme')
}
</script>

<style scoped>
.menu-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-bottom: 12px;
}

.export-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  margin-bottom: 12px;
}

.export-loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #93c5fd;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: mm-spin 1s linear infinite;
}

.export-loading-text {
  font-size: 13px;
  font-weight: 500;
  color: #1d4ed8;
}

.menu-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-actions.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

.nav-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
}

.nav-icon-export {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.nav-icon-export-all {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateX(4px);
}

.action-btn:disabled,
.action-btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-btn:disabled:hover,
.action-btn-disabled:hover {
  background: white;
  border-color: #e5e7eb;
  transform: none;
}

.action-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #34d399;
}

.action-btn-primary {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #6ee7b7;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-label {
  font-weight: 600;
  color: #1f2937;
}

.action-hint {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
}

.spinner-icon {
  animation: mm-spin 1s linear infinite;
}

@keyframes mm-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
