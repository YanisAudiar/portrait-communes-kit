<template>
  <section class="print-section-page context-page">
    <h2 class="page-title-main">Contexte Territorial</h2>

    <div class="context-grid">
      <!-- Carte de situation -->
      <div class="context-map-wrapper">
        <PrintContextMap
          :code-insee="codeInsee"
          :commune-name="communeName"
          :geojson="communesGeoJson"
          @map-loaded="$emit('map-loaded')"
        />
      </div>

      <!-- Chiffres clés de la commune -->
      <div class="commune-info-wrapper">
        <h3 class="section-title">Chiffres clés</h3>
        <div class="kpi-row">
          <div v-if="communeData?.population" class="kpi-item">
            <span class="kpi-value">{{ formatKpi(communeData.population) }}</span>
            <span class="kpi-label">Population</span>
          </div>
          <div v-if="communeData?.nb_menages" class="kpi-item">
            <span class="kpi-value">{{ formatKpi(communeData.nb_menages) }}</span>
            <span class="kpi-label">Ménages</span>
          </div>
        </div>
        <div class="kpi-row mt-4">
          <div v-if="communeData?.superficie" class="kpi-item">
            <span class="kpi-value">{{ formatNumber(communeData.superficie) }}</span>
            <span class="kpi-label">Superficie (km²)</span>
          </div>
          <div v-if="communeData?.densite" class="kpi-item">
            <span class="kpi-value">{{ formatNumber(communeData.densite) }}</span>
            <span class="kpi-label">Densité (hab/km²)</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import PrintContextMap from '@/components/Print/PrintContextMap.vue'
import { formatNumber } from '@/utils/printFormatters'

/** Données agrégées de la commune (population, ménages, superficie, densité) */
interface CommuneData {
  population?: number
  nb_menages?: number
  superficie?: number
  densite?: number
}

defineProps<{
  codeInsee: string
  communeName?: string | null
  communeData?: CommuneData | null
  communesGeoJson?: unknown
}>()

defineEmits<{
  (e: 'map-loaded'): void
}>()

/** Formate un KPI entier (population, ménages) */
function formatKpi(value: number): string {
  return Math.round(value).toLocaleString('fr-FR')
}
</script>

<style scoped>
/* Page Contexte Territorial : carte + chiffres clés */
.print-section-page {
  width: 100%;
  min-height: 185mm;
  height: auto;
  padding: 0 10mm;
  page-break-after: always;
  page-break-inside: avoid;
  display: flex;
  flex-direction: column;
  background: white;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
}

.page-title-main {
  font-family: 'Montserrat', sans-serif;
  font-size: 32px;
  color: #316d7b;
  margin-bottom: 30px;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 4px solid #316d7b;
  padding-bottom: 10px;
  display: inline-block;
  width: 100%;
}

.context-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  flex: 1;
  align-items: stretch;
}

.context-map-wrapper {
  height: 100%;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.commune-info-wrapper {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.commune-info-wrapper .section-title {
  font-size: 20px;
  margin-bottom: 25px;
  color: #2c3e50;
  font-weight: 700;
  text-transform: uppercase;
  border-left: 4px solid var(--primary-color, #5a4c8c);
  padding-left: 10px;
}

.kpi-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.kpi-row.mt-4 {
  margin-top: 10px;
}

.kpi-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 15px 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.kpi-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--primary-color, #5a4c8c);
  line-height: 1.2;
  margin-bottom: 5px;
  font-family: 'Montserrat', sans-serif;
}

.kpi-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Responsive prévisualisation */
@media screen and (max-width: 768px) {
  .context-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .context-map-wrapper {
    min-height: 300px;
    order: 1;
  }

  .commune-info-wrapper {
    order: 2;
  }

  .page-title-main {
    font-size: 24px;
  }

  .kpi-row {
    flex-direction: column;
    gap: 12px;
  }

  .kpi-value {
    font-size: 1.8rem;
  }

  .print-section-page {
    min-height: auto;
    padding: 0 16px;
  }
}

@media screen and (max-width: 480px) {
  .page-title-main {
    font-size: 20px;
    padding-bottom: 8px;
  }

  .kpi-value {
    font-size: 1.5rem;
  }

  .kpi-label {
    font-size: 0.75rem;
  }
}

/* Impression */
@media print {
  .print-section-page {
    overflow: visible !important;
    height: auto !important;
  }

  .context-grid {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    gap: 30px !important;
    width: 100% !important;
  }

  .context-map-wrapper {
    flex: 1.4 !important;
    width: auto !important;
    height: auto !important;
    min-height: 400px !important;
    overflow: visible !important;
    background: transparent !important;
    z-index: 10;
  }

  .commune-info-wrapper {
    display: flex !important;
    flex: 1 !important;
    width: auto !important;
    flex-direction: column !important;
    background: #f8f9fa !important;
    padding: 20px !important;
    border-radius: 8px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    page-break-inside: avoid !important;
  }
}
</style>
