<template>
  <div v-if="isMobile" class="mobile-map-controls">
    <!-- Bouton zoom in -->
    <button 
      class="map-control-btn"
      @click="zoomIn"
      aria-label="Zoom avant"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <!-- Bouton zoom out -->
    <button 
      class="map-control-btn"
      @click="zoomOut"
      aria-label="Zoom arrière"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <!-- Bouton recenter -->
    <button 
      class="map-control-btn"
      @click="recenter"
      aria-label="Recentrer la carte"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4"></path>
      </svg>
    </button>

    <!-- Bouton plein écran -->
    <button 
      class="map-control-btn map-control-fullscreen"
      :class="{ active: isFullscreen }"
      @click="toggleFullscreen"
      aria-label="Plein écran"
    >
      <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 3 21 3 21 9"></polyline>
        <polyline points="9 21 3 21 3 15"></polyline>
        <line x1="21" y1="3" x2="14" y2="10"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="4 14 10 14 10 20"></polyline>
        <polyline points="20 10 14 10 14 4"></polyline>
        <line x1="14" y1="10" x2="21" y2="3"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * MobileMapControls - Contrôles de carte optimisés pour mobile
 * Affiche des boutons tactiles pour zoom et navigation
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/stores'

// Store de la carte
const mapStore = useMapStore()

// État local
const isMobile = ref(false)
const isFullscreen = ref(false)

// Configuration de la carte par défaut (Bretagne)
const DEFAULT_CENTER: [number, number] = [-1.6778, 48.1173]
const DEFAULT_ZOOM = 8

/**
 * Vérifie si on est sur mobile
 */
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

/**
 * Zoom avant
 */
const zoomIn = () => {
  const map = mapStore.map
  if (map) {
    map.zoomIn({ duration: 300 })
  }
}

/**
 * Zoom arrière
 */
const zoomOut = () => {
  const map = mapStore.map
  if (map) {
    map.zoomOut({ duration: 300 })
  }
}

/**
 * Recentrer la carte
 */
const recenter = () => {
  const map = mapStore.map
  if (map) {
    map.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      duration: 800
    })
  }
}

/**
 * Basculer le mode plein écran
 */
const toggleFullscreen = () => {
  const mapContainer = document.querySelector('.map-wrapper') as HTMLElement
  
  if (!mapContainer) return
  
  if (!isFullscreen.value) {
    // Passer en plein écran
    if (mapContainer.requestFullscreen) {
      mapContainer.requestFullscreen()
    } else if ((mapContainer as any).webkitRequestFullscreen) {
      (mapContainer as any).webkitRequestFullscreen()
    }
    isFullscreen.value = true
  } else {
    // Sortir du plein écran
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    }
    isFullscreen.value = false
  }
}

/**
 * Gérer le changement de plein écran externe
 */
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
/* ============================================
   MOBILE MAP CONTROLS
   ============================================ */

.mobile-map-controls {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: none;
  border-radius: 12px;
  color: #1f2937;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.map-control-btn:active {
  transform: scale(0.92);
  background: rgba(240, 240, 240, 0.95);
}

.map-control-fullscreen {
  margin-top: 8px;
}

.map-control-fullscreen.active {
  background: var(--primary-blue, #1e2972);
  color: white;
}

/* ============================================
   PETITS MOBILES
   ============================================ */

@media (max-width: 479px) {
  .mobile-map-controls {
    right: 8px;
    gap: 6px;
  }

  .map-control-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .map-control-btn svg {
    width: 18px;
    height: 18px;
  }
}

/* ============================================
   PAYSAGE MOBILE
   ============================================ */

@media (max-width: 767px) and (orientation: landscape) {
  .mobile-map-controls {
    right: 8px;
    top: auto;
    bottom: 12px;
    transform: none;
    flex-direction: row;
  }

  .map-control-fullscreen {
    margin-top: 0;
    margin-left: 8px;
  }
}

/* ============================================
   MASQUER SUR DESKTOP
   ============================================ */

@media (min-width: 768px) {
  .mobile-map-controls {
    display: none;
  }
}
</style>
