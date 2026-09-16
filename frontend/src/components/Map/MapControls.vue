<template>
  <div class="map-controls-panel">
    <div class="control-group">
      <label>Précision</label>
      <select v-model="selectedPrecision" @change="onPrecisionChange">
        <option value="low">Vue générale</option>
        <option value="medium">Vue standard</option>
        <option value="high">Vue détaillée</option>
      </select>
    </div>
    
    <div class="control-group">
      <button @click="resetView" class="control-btn">
        🏠 Réinitialiser
      </button>
    </div>
    
    <div class="control-group">
      <button @click="toggleFullscreen" class="control-btn">
        🔍 Plein écran
      </button>
    </div>
    
    <div class="stats" v-if="stats">
      <div class="stat-item">
        <span class="stat-label">Communes:</span>
        <span class="stat-value">{{ stats.communesCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Zoom:</span>
        <span class="stat-value">{{ stats.zoom }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  precision: {
    type: String,
    default: 'medium'
  },
  stats: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['precision-change', 'reset-view', 'toggle-fullscreen'])

const selectedPrecision = ref(props.precision)

watch(() => props.precision, (newVal) => {
  selectedPrecision.value = newVal
})

const onPrecisionChange = () => {
  emit('precision-change', selectedPrecision.value)
}

const resetView = () => {
  emit('reset-view')
}

const toggleFullscreen = () => {
  emit('toggle-fullscreen')
}
</script>

<style scoped>
.map-controls-panel {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.control-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.control-btn {
  width: 100%;
  padding: 8px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.control-btn:hover {
  background: #2980b9;
}

.stats {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}
</style>
