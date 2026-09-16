<template>
  <div class="print-context-map-container">
    <h3 class="map-title">Localisation dans {{ territoryName }}</h3>
    
    <div class="map-wrapper">
      <svg 
        :viewBox="`0 0 ${width} ${height}`" 
        class="map-svg"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Groupe de toutes les communes (contexte) -->
        <g class="communes-layer">
          <path
            v-for="commune in paths"
            :key="commune.id"
            :d="commune.d"
            class="commune-path context"
            :class="{ 'highlight': isHighlight(commune) }"
          />
        </g>

        <!-- Commune sélectionnée redessinée par dessus pour la bordure -->
        <g class="highlight-layer">
          <path
            v-if="highlightedPath"
            :d="highlightedPath.d"
            class="commune-path highlight-border"
          />
        </g>
      </svg>
    </div>

    <div class="map-legend">
      <div class="legend-item">
        <span class="color-box highlight"></span>
        <span>{{ communeName }}</span>
      </div>
      <div class="legend-item">
        <span class="color-box context"></span>
        <span>{{ territoryName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { MAP_DIMENSIONS } from '@/utils/printMapHelpers'
import { usePrintMap } from '@/composables/usePrintMap'
import { siteConfig } from '@/config/site'

const territoryName = siteConfig.territory.name

const props = defineProps({
  codeInsee: { type: String, required: true },
  communeName: { type: String, default: 'Commune' },
  geojson: { type: Object, default: null }
})

const emit = defineEmits(['map-loaded'])

const width = MAP_DIMENSIONS.width
const height = MAP_DIMENSIONS.height

const {
  paths,
  highlightedPath,
  isHighlight,
  initialize
} = usePrintMap(computed(() => props.codeInsee), computed(() => props.geojson))

onMounted(async () => {
  await initialize()
  emit('map-loaded')
})

watch(() => props.geojson, async (newVal) => {
  if (newVal?.features?.length) {
    await initialize()
    emit('map-loaded')
  }
}, { deep: true })
</script>

<style scoped>
.print-context-map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-title {
  margin-bottom: 15px;
  color: #316D7B;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  text-transform: uppercase;
}

.map-wrapper {
  width: 100%;
  height: 400px;
  position: relative;
  overflow: visible;
}

.map-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.commune-path {
  stroke-linejoin: round;
  stroke-linecap: round;
}

/* Style des communes contextuelles (fond) */
.commune-path.context {
  fill: #f0f2f5;
  stroke: #bdc3c7;
  stroke-width: 0.5px;
}

/* Style de la commune active */
.commune-path.highlight {
  fill: #316D7B;
  stroke: #2c3e50;
  stroke-width: 0;
}

/* Layer supérieur pour la bordure de mise en valeur */
.commune-path.highlight-border {
  fill: none;
  stroke: #2c3e50;
  stroke-width: 2px;
}

.map-legend {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  font-family: 'Lato', sans-serif;
  font-size: 11px;
  width: 100%;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.color-box.highlight {
  background: #316D7B;
  border: 1px solid #2c3e50;
}

.color-box.context {
  background: #f0f2f5;
  border: 1px solid #bdc3c7;
}

/* Force l'impression des couleurs */
@media print {
  .map-svg, path, .color-box {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    visibility: visible !important;
    opacity: 1 !important;
  }
}
</style>
