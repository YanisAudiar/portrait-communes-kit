<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h3>⚙️ Paramètres</h3>
      <div class="setting-group">
        <label>Thème de la carte</label>
        <select v-model="localMapTheme" @change="onMapThemeChange" class="setting-select">
          <option value="standard">Standard</option>
          <option value="satellite">Satellite</option>
          <option value="terrain">Terrain</option>
        </select>
      </div>
      <div class="setting-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="localShowPopulation" @change="onShowPopulationChange">
          Afficher la population
        </label>
      </div>
      <button @click="$emit('close')" class="modal-btn">Fermer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  mapTheme: {
    type: String,
    default: 'standard'
  },
  showPopulation: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:mapTheme', value: string): void
  (e: 'update:showPopulation', value: boolean): void
}>()

function onMapThemeChange(e: Event) {
  const el = e.target as HTMLSelectElement | null
  if (el) emit('update:mapTheme', el.value)
}

function onShowPopulationChange(e: Event) {
  const el = e.target as HTMLInputElement | null
  if (el) emit('update:showPopulation', el.checked)
}

// Local state pour éviter les mutations directes des props
const localMapTheme = ref<string>(props.mapTheme)
const localShowPopulation = ref<boolean>(props.showPopulation)

// Watchers pour synchroniser avec les props
watch(() => props.mapTheme, (newVal) => {
  localMapTheme.value = newVal
})

watch(() => props.showPopulation, (newVal) => {
  localShowPopulation.value = newVal
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.setting-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.setting-select {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--bg-light);
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Roboto', sans-serif;
  background: var(--bg-white);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.setting-select:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px rgba(241, 126, 8, 0.1);
}

.setting-group input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.modal-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.modal-btn:hover {
  background: #2980b9;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    padding: 16px;
    margin: 16px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
  }
  
  .modal-content h3 {
    font-size: 18px;
  }
  
  .setting-group label {
    font-size: 14px;
  }
  
  .setting-select {
    font-size: 14px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 12px;
    margin: 12px;
  }
  
  .modal-content h3 {
    font-size: 16px;
  }
  
  .setting-group label {
    font-size: 13px;
  }
  
  .setting-select {
    font-size: 13px;
    padding: 8px;
  }
}
</style>
