<template>
  <div class="map-overlay-info">
    <!-- Badge principal -->
    <div class="info-badge">
      <span class="info-icon">{{ icon }}</span>
      <span class="info-text">{{ title }}</span>
    </div>
    
    <!-- Badge secondaire (indicateur) -->
    <div v-if="subtitle || value" class="indicator-badge">
      <span v-if="subtitle" class="indicator-label">{{ subtitle }}</span>
      <span v-if="value" class="indicator-value">{{ value }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * Composant générique pour afficher des informations en overlay sur une carte
 * Réutilisable pour différents types d'informations
 */

defineProps({
  icon: {
    type: String,
    default: '📍'
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: null
  },
  value: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.map-overlay-info {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.info-badge,
.indicator-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.info-icon {
  font-size: 20px;
}

.info-text,
.indicator-label {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.indicator-value {
  font-size: 18px;
  font-weight: 700;
  color: #f17e08;
  margin-left: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .map-overlay-info {
    top: 12px;
    left: 12px;
    gap: 8px;
  }

  .info-badge,
  .indicator-badge {
    padding: 10px 14px;
    gap: 8px;
  }

  .info-text,
  .indicator-label {
    font-size: 13px;
  }

  .indicator-value {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .map-overlay-info {
    top: 10px;
    left: 10px;
  }

  .info-badge,
  .indicator-badge {
    padding: 8px 12px;
  }

  .info-text,
  .indicator-label {
    font-size: 12px;
  }

  .indicator-value {
    font-size: 15px;
  }
}
</style>

