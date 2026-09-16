<template>
  <header class="audiar-header">
    <div class="header-container">
      <!-- Logo et navigation principale -->
      <div class="header-left">
        <LogoSection />
        <div v-if="$slots['header-context']" class="header-context hide-mobile">
          <slot name="header-context" />
        </div>
      </div>
      
      <!-- Barre de recherche et actions -->
      <div class="header-right">
        <div v-if="$slots['header-actions']" class="header-action-buttons hide-mobile">
          <slot name="header-actions" />
        </div>
        <HeaderSearch />
        <HeaderActions 
          @info-click="onInfoClick"
          @settings-click="onSettingsClick"
          @menu-click="toggleMobileMenu"
        />
      </div>
    </div>
    
    <!-- Menu mobile -->
    <MobileMenu 
      :is-open="isMobileMenuOpen"
      @close="closeMobileMenu"
      @info-click="onInfoClick"
      @settings-click="onSettingsClick"
      @search="onSearch"
    />
  </header>
</template>

<script setup lang="ts">
/**
 * Composant AppHeader - En-tête principal de l'application
 * Refactorisé pour respecter la limite de 200 lignes par composant
 * Utilise des sous-composants pour la modularité
 */
import { ref, onMounted, onUnmounted } from 'vue'
import LogoSection from './LogoSection.vue'
import HeaderSearch from './HeaderSearch.vue'
import HeaderActions from './HeaderActions.vue'
import MobileMenu from './MobileMenu.vue'
import '@/assets/css/components/app-header.css'

const props = defineProps({
  stats: {
    type: Object,
    default: null
  }
})

const emit = defineEmits<{
  (e: 'info-click'): void
  (e: 'settings-click'): void
  (e: 'search', query: string): void
}>()

// État du menu mobile
const isMobileMenuOpen = ref<boolean>(false)

/**
 * Ferme le menu mobile
 */
const closeMobileMenu = (): void => {
  isMobileMenuOpen.value = false
}

/**
 * Bascule l'état du menu mobile
 */
const toggleMobileMenu = (): void => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

/**
 * Gère le clic sur le bouton informations
 */
const onInfoClick = (): void => {
  emit('info-click')
  closeMobileMenu()
}

/**
 * Gère le clic sur le bouton paramètres
 */
const onSettingsClick = (): void => {
  emit('settings-click')
  closeMobileMenu()
}

/**
 * Gère la recherche
 */
const onSearch = (query: string): void => {
  emit('search', query)
}

/**
 * Ferme le menu en cliquant à l'extérieur
 */
const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement
  if (isMobileMenuOpen.value && !target.closest('.mobile-menu')) {
    closeMobileMenu()
  }
}

// Écouter l’ouverture du menu depuis la barre du bas (mobile)
function handleToggleMobileMenuEvent() {
  toggleMobileMenu()
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('toggle-mobile-menu', handleToggleMobileMenuEvent)
  }
})

// Ajouter l'écouteur d'événements
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('toggle-mobile-menu', handleToggleMobileMenuEvent)
  })
}
</script>

<style scoped>
/* Styles importés depuis le fichier CSS externe */
</style>