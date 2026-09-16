<!-- 
  Composant pour ajouter des effets visuels modernes à la carte
  Peut être ajouté par-dessus MapContainer pour des effets overlay
-->

<template>
  <div class="map-enhancements">
    <!-- Effet de vignette subtil -->
    <div class="vignette-overlay"></div>
    
    <!-- Indicateur de chargement élégant -->
    <Transition name="fade">
      <div v-if="loading" class="modern-loader">
        <div class="loader-ring"></div>
        <div class="loader-text">Chargement...</div>
      </div>
    </Transition>
    
    <!-- Coins arrondis overlay pour effet moderne -->
    <div class="corner-overlay top-left"></div>
    <div class="corner-overlay top-right"></div>
    <div class="corner-overlay bottom-left"></div>
    <div class="corner-overlay bottom-right"></div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.map-enhancements {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* Effet de vignette subtil */
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    transparent 0%,
    transparent 60%,
    rgba(0, 0, 0, 0.03) 100%
  );
  pointer-events: none;
}

/* Loader moderne */
.modern-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  pointer-events: all;
}

.loader-ring {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 4px solid transparent;
  border-top-color: #f17e08;
  border-right-color: #e36411;
  animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  position: relative;
}

.loader-ring::after {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-bottom-color: #1e2972;
  border-left-color: #316d7b;
  animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse;
}

.loader-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Coins arrondis pour effet moderne */
.corner-overlay {
  position: absolute;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  pointer-events: none;
}

.corner-overlay.top-left {
  top: 0;
  left: 0;
  border-top-left-radius: 16px;
}

.corner-overlay.top-right {
  top: 0;
  right: 0;
  border-top-right-radius: 16px;
}

.corner-overlay.bottom-left {
  bottom: 0;
  left: 0;
  border-bottom-left-radius: 16px;
}

.corner-overlay.bottom-right {
  bottom: 0;
  right: 0;
  border-bottom-right-radius: 16px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

