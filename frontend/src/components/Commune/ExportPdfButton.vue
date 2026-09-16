<template>
  <div v-if="ENABLE_PDF_EXPORT" class="export-pdf-container">
    <!-- Bouton principal (désactivé provisoirement si featureDisabled) -->
    <button
      class="export-pdf-btn btn-export"
      @click.stop="toggleMenu"
      :disabled="isExporting || featureDisabled"
      :class="{ 'is-loading': isExporting, 'is-disabled-feature': featureDisabled }"
    >
      <span class="btn-icon">
        <svg v-if="!isExporting" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <svg v-else class="spinner" width="20" height="20" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"></path>
        </svg>
      </span>
      <span class="btn-text">
        {{ isExporting ? 'Génération en cours...' : 'Exporter en PDF' }}
      </span>
    </button>

    <!-- Menu déroulant (composant dédié) -->
    <transition name="slide-fade">
      <div v-if="showMenu" v-click-outside="closeMenu" class="export-menu-wrapper">
        <ExportPdfMenu
          :active-theme-id="activeThemeId"
          :active-theme-name="activeThemeName"
          :is-exporting="isExporting"
          :export-progress="exportProgress"
          :export-error="exportError ?? ''"
          @close="closeMenu"
          @export-current-theme="handleExportCurrentTheme"
          @export-all-themes="handleExportAllThemes"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Directive } from 'vue'
import { usePdfExport } from '@/composables/usePdfExport'
import ExportPdfMenu from '@/components/Commune/ExportPdfMenu.vue'
import { ENABLE_PDF_EXPORT } from '@/config/featureFlags'

/** Export PDF : contrôlé par le feature flag (désactivé tant que non livré en UI) */
const featureDisabled = !ENABLE_PDF_EXPORT

// Props strictement minimales : on reste sur l'ancien comportement
const props = defineProps({
  codeInsee: {
    type: String,
    required: true
  },
  activeThemeId: {
    type: String,
    default: null
  },
  activeThemeName: {
    type: String,
    default: null
  }
})

const emit = defineEmits<{
  (e: 'export-start', payload: { type: string, themeId?: string }): void
  (e: 'export-success', payload: { type: string, themeId?: string }): void
  (e: 'export-error', payload: { type: string, error: string }): void
}>()

const showMenu = ref<boolean>(false)

// On ne garde que les méthodes legacy (Puppeteer)
const {
  isExporting,
  exportError,
  exportProgress,
  exportThemeToPDF,
  exportAllThemesToPDF
} = usePdfExport()

const toggleMenu = (): void => {
  if (featureDisabled || isExporting.value) return
  showMenu.value = !showMenu.value
}

const closeMenu = (): void => {
  showMenu.value = false
}

/** Ouvrir le menu (pour la barre du bas mobile) */
const openMenu = (): void => {
  if (featureDisabled || isExporting.value) return
  showMenu.value = true
}

defineExpose({ openMenu })

// Export de la thématique actuelle (ancienne config Puppeteer)
const handleExportCurrentTheme = async (): Promise<void> => {
  if (!props.activeThemeId) {
    return
  }

  closeMenu()
  emit('export-start', { type: 'theme', themeId: props.activeThemeId })

  try {
    await exportThemeToPDF(props.codeInsee, props.activeThemeId)
    emit('export-success', { type: 'theme', themeId: props.activeThemeId })
  } catch (error: any) {
    emit('export-error', { type: 'theme', error: error.message })
  }
}

// Export de toutes les thématiques (ancienne config Puppeteer)
const handleExportAllThemes = async (): Promise<void> => {
  closeMenu()
  emit('export-start', { type: 'all' })

  try {
    await exportAllThemesToPDF(props.codeInsee)
    emit('export-success', { type: 'all' })
  } catch (error: any) {
    emit('export-error', { type: 'all', error: error.message })
  }
}

// Directive personnalisée pour détecter les clics en dehors
const vClickOutside: Directive = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
.export-pdf-container {
  position: relative;
  display: inline-block;
  z-index: 5000;
}

/* Bouton principal : fond teal plein + icône download + coins arrondis */
.export-pdf-btn,
.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bleu-eucalyptus, #316d7b);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 5100;
}

.export-pdf-btn:hover:not(:disabled),
.btn-export:hover:not(:disabled) {
  background: #2a5c68;
}

.export-pdf-btn:active:not(:disabled) {
  transform: translateY(0);
}

.export-pdf-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.export-pdf-btn.is-loading {
  background: #4a8a9a;
  cursor: wait;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.btn-text {
  white-space: nowrap;
}

/* Wrapper du menu (position pour ExportPdfMenu) */
.export-menu-wrapper {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 5200;
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}

@media (max-width: 768px) {
  .export-menu-wrapper {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  .export-pdf-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>

