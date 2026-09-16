<template>
  <aside 
    class="sidebar sidebar-left" 
    :class="{ 'sidebar-collapsed': isCollapsed }"
    ref="sidebarRef"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Handle de swipe pour mobile -->
    <div 
      v-if="isMobile" 
      class="sidebar-handle"
      @click="toggleCollapse"
    >
      <span class="handle-bar"></span>
      <span class="handle-text">{{ isCollapsed ? 'Voir les communes' : 'Réduire' }}</span>
    </div>
    
    <div class="sidebar-content">
      <CommunesList />
    </div>
  </aside>
</template>

<script setup lang="ts">
/**
 * SidebarLeft - Panneau latéral gauche avec liste des communes
 * Version responsive avec gestion du swipe sur mobile
 */
import { ref, onMounted, onUnmounted } from 'vue'
import CommunesList from './CommunesList.vue'

// État du composant
const isCollapsed = ref(false)
const isMobile = ref(false)
const sidebarRef = ref<HTMLElement | null>(null)

// Variables pour le swipe
let touchStartY = 0
let touchCurrentY = 0
const SWIPE_THRESHOLD = 50

/**
 * Vérifie si on est sur mobile
 */
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

/**
 * Bascule l'état collapsed
 */
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

/**
 * Gère le début du touch
 */
const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return
  const t = e.touches[0]
  if (!t) return
  touchStartY = t.clientY
}

/**
 * Gère le mouvement du touch
 */
const handleTouchMove = (e: TouchEvent) => {
  if (!isMobile.value) return
  const t = e.touches[0]
  if (!t) return
  touchCurrentY = t.clientY
}

/**
 * Gère la fin du touch - détecte le swipe
 */
const handleTouchEnd = () => {
  if (!isMobile.value) return
  
  const deltaY = touchCurrentY - touchStartY
  
  // Swipe vers le bas = collapse
  if (deltaY > SWIPE_THRESHOLD && !isCollapsed.value) {
    isCollapsed.value = true
  }
  // Swipe vers le haut = expand
  else if (deltaY < -SWIPE_THRESHOLD && isCollapsed.value) {
    isCollapsed.value = false
  }
  
  // Reset
  touchStartY = 0
  touchCurrentY = 0
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.sidebar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  z-index: 100;
  border: none;
  animation: slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.sidebar-left {
  width: 400px;
  border-right: 1px solid rgba(229, 231, 235, 0.6);
  flex-shrink: 0;
}

/* Handle de swipe - caché par défaut */
.sidebar-handle {
  display: none;
}

.sidebar-content {
  padding: 28px;
  flex: 1;
  min-width: 0; /* Flex child peut rétrécir, évite overflow horizontal */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ============================================
   TABLETTES (768px - 1023px)
   ============================================ */

@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar-left {
    width: 320px;
  }
  
  .sidebar-content {
    padding: 20px;
  }
}

/* ============================================
   MOBILE (< 768px)
   ============================================ */

@media (max-width: 767px) {
  .sidebar {
    width: 100%;
    max-width: 100vw;
    background: rgba(255, 255, 255, 0.98);
    overflow: hidden;
  }
  
  .sidebar-left {
    width: 100%;
    max-width: 100%;
    border-right: none;
    border-top: 1px solid rgba(229, 231, 235, 0.6);
  }
  
  /* Évite débordement du contenu (select, textes) */
  .sidebar-content {
    min-width: 0;
    overflow-x: hidden;
  }
  
  /* Handle visible sur mobile */
  .sidebar-handle {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 16px 8px;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  
  .handle-bar {
    width: 40px;
    height: 4px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 2px;
    transition: background 0.2s ease;
  }
  
  .sidebar-handle:active .handle-bar {
    background: rgba(0, 0, 0, 0.3);
  }
  
  .handle-text {
    font-size: 11px;
    color: #6b7280;
    margin-top: 6px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .sidebar-content {
    padding: 0 16px 16px;
    max-height: calc(40vh - 60px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* État collapsed */
  .sidebar-collapsed .sidebar-content {
    display: none;
  }
  
  .sidebar-collapsed .handle-text {
    color: var(--primary-blue, #1e2972);
  }
}

/* ============================================
   PETITS MOBILES (< 480px)
   ============================================ */

@media (max-width: 479px) {
  .sidebar-content {
    padding: 0 12px 12px;
    max-height: calc(45vh - 56px);
  }
  
  .sidebar-handle {
    padding: 10px 12px 6px;
  }
  
  .handle-text {
    font-size: 10px;
  }
}

/* ============================================
   PAYSAGE MOBILE
   ============================================ */

@media (max-width: 767px) and (orientation: landscape) {
  .sidebar-handle {
    display: none;
  }
  
  .sidebar-content {
    padding: 16px;
    max-height: none;
  }
  
  .sidebar-collapsed .sidebar-content {
    display: flex;
  }
}

/* ============================================
   ANIMATIONS
   ============================================ */

@keyframes slideInLeft {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
