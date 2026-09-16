<template>
  <div class="map-toolbar" :class="position">
    <button
      v-for="button in buttons"
      :key="button.id"
      @click="button.onClick"
      :class="['toolbar-btn', { active: button.active }]"
      :title="button.tooltip"
    >
      <span v-if="button.icon">{{ button.icon }}</span>
      <span v-if="button.label && showLabels" class="btn-label">{{ button.label }}</span>
    </button>
  </div>
</template>

<script setup>
/**
 * Composant générique pour une barre d'outils de carte
 * Supporte différentes positions et configurations de boutons
 */

defineProps({
  buttons: {
    type: Array,
    required: true,
    validator: (buttons) => {
      return buttons.every(b => b.id && b.onClick)
    }
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => {
      return ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'vertical-right'].includes(value)
    }
  },
  showLabels: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.map-toolbar {
  position: absolute;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.map-toolbar.top-right {
  top: 20px;
  right: 20px;
}

.map-toolbar.top-left {
  top: 20px;
  left: 20px;
}

.map-toolbar.bottom-right {
  bottom: 20px;
  right: 20px;
}

.map-toolbar.bottom-left {
  bottom: 20px;
  left: 20px;
}

.map-toolbar.vertical-right {
  top: 80px;
  right: 20px;
  flex-direction: column;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-size: 14px;
  font-weight: 600;
}

.toolbar-btn:hover {
  background: rgba(241, 126, 8, 0.1);
  border-color: #f17e08;
  color: #f17e08;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(241, 126, 8, 0.2);
}

.toolbar-btn.active {
  background: linear-gradient(135deg, #f17e08 0%, #e36411 100%);
  color: white;
  border-color: #f17e08;
  box-shadow: 0 4px 16px rgba(241, 126, 8, 0.4);
}

.toolbar-btn.active:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(241, 126, 8, 0.5);
}

/* Boutons sans label (icône seule) */
.map-toolbar.vertical-right .toolbar-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 10px;
}

.btn-label {
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  .map-toolbar.top-right,
  .map-toolbar.top-left {
    top: 12px;
  }

  .map-toolbar.top-right {
    right: 12px;
  }

  .map-toolbar.vertical-right {
    top: 68px;
    right: 12px;
    gap: 6px;
  }

  .toolbar-btn {
    padding: 10px 16px;
    font-size: 13px;
    gap: 8px;
  }

  .map-toolbar.vertical-right .toolbar-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .btn-label {
    display: none;
  }
}

@media (max-width: 480px) {
  .map-toolbar.top-right,
  .map-toolbar.top-left {
    top: 10px;
  }

  .map-toolbar.top-right {
    right: 10px;
  }

  .toolbar-btn {
    padding: 8px 12px;
  }

  .map-toolbar.vertical-right {
    top: 58px;
    right: 10px;
  }

  .map-toolbar.vertical-right .toolbar-btn {
    width: 34px;
    height: 34px;
  }
}
</style>

