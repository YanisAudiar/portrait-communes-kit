<template>
  <transition name="sticky-slide">
    <div
      v-if="visible"
      class="sticky-mobile-header"
    >
      <router-link to="/" class="sticky-back" aria-label="Retour à l'accueil">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </router-link>
      <div class="sticky-info">
        <span class="sticky-commune">{{ communeName }}</span>
        <span class="sticky-separator">&mdash;</span>
        <span class="sticky-theme" :style="{ color: themeColor }">{{ themeName }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  /** Nom de la commune */
  communeName: {
    type: String,
    default: 'Commune'
  },
  /** Nom du thème actif */
  themeName: {
    type: String,
    default: ''
  },
  /** Couleur du thème */
  themeColor: {
    type: String,
    default: '#0A3D62'
  }
})

const visible = ref(false)

/** Seuil de scroll pour afficher le header sticky (en pixels) */
const SCROLL_THRESHOLD = 180

const handleScroll = () => {
  visible.value = window.scrollY > SCROLL_THRESHOLD
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.sticky-mobile-header {
  display: none;
}

/* Visible uniquement sur mobile */
@media (max-width: 767px) {
  .sticky-mobile-header {
    display: flex;
    align-items: center;
    gap: 10px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid rgba(229, 231, 235, 0.6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .sticky-back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    color: #0A3D62;
    text-decoration: none;
    flex-shrink: 0;
    transition: background 0.15s ease;
  }

  .sticky-back:hover,
  .sticky-back:active {
    background: rgba(10, 61, 98, 0.08);
  }

  .sticky-info {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    overflow: hidden;
  }

  .sticky-commune {
    font-size: 14px;
    font-weight: 700;
    color: #323F4B;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sticky-separator {
    color: #cbd5e1;
    font-size: 12px;
    flex-shrink: 0;
  }

  .sticky-theme {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Safe area top (encoche iPhone) */
@supports (padding-top: env(safe-area-inset-top)) {
  @media (max-width: 767px) {
    .sticky-mobile-header {
      padding-top: calc(10px + env(safe-area-inset-top));
    }
  }
}

/* Transitions */
.sticky-slide-enter-active {
  transition: all 0.2s ease-out;
}

.sticky-slide-leave-active {
  transition: all 0.15s ease-in;
}

.sticky-slide-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.sticky-slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
