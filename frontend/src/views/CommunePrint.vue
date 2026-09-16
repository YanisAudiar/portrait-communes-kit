<template>
  <div class="commune-print" :class="{ 'print-ready': isReady }">
    <!-- Page de Garde -->
    <PrintCoverPage
      :commune-name="communeData?.nom || codeInsee"
      :code-insee="codeInsee"
      :date="formatDate(new Date())"
      :theme-name="!showAllThemes && currentTheme ? currentTheme.label : null"
    />

    <!-- Page 2 : Contexte Territorial (carte + chiffres clés) -->
    <PrintContextPage
      :code-insee="codeInsee ?? ''"
      :commune-name="communeData?.nom"
      :commune-data="communeData"
      :communes-geo-json="communesGeoJson"
      @map-loaded="handleMapReady"
    />

    <!-- Graphiques par thématique -->
    <div v-if="showAllThemes" class="print-themes">
      <PrintThemePage
        v-for="theme in availableThemes"
        :key="theme.id"
        :theme="theme"
        :layout="getLayoutForTheme(theme) ?? undefined"
        :chart-data="themeChartPayload(theme.id)"
        :evolution-data="theme.id === 'demographie' ? evolutionData : []"
        :commune-name="communeData?.nom || ''"
        :kpis="SHOW_COMMUNE_KEY_INDICATORS ? getKPIsForTheme(theme.id) : []"
        :get-chart-type-for-theme="getChartTypeForTheme"
        :get-dataset-by-key="() => []"
        :print-chart-width="PRINT_BAR_WIDTH"
        :print-chart-height="PRINT_BAR_HEIGHT"
        :print-donut-width="PRINT_DONUT_WIDTH"
        :print-donut-height="PRINT_DONUT_HEIGHT"
        :print-line-chart-width="PRINT_LINE_CHART_WIDTH"
        :print-line-chart-height="PRINT_LINE_CHART_HEIGHT"
        @chart-ready="handleChartReady"
      />
    </div>

    <!-- Graphiques pour une seule thématique -->
    <div v-else-if="currentTheme && getLayoutForTheme(currentTheme)" class="print-single-theme">
      <PrintThemePage
        :theme="currentTheme"
        :layout="getLayoutForTheme(currentTheme) ?? undefined"
        :chart-data="themeChartPayload(currentTheme.id)"
        :evolution-data="currentTheme.id === 'demographie' ? evolutionData : []"
        :commune-name="communeData?.nom || ''"
        :kpis="SHOW_COMMUNE_KEY_INDICATORS ? getKPIsForTheme(currentTheme.id) : []"
        :get-chart-type-for-theme="getChartTypeForTheme"
        :get-dataset-by-key="() => []"
        :print-chart-width="PRINT_BAR_WIDTH"
        :print-chart-height="PRINT_BAR_HEIGHT"
        :print-donut-width="PRINT_DONUT_WIDTH"
        :print-donut-height="PRINT_DONUT_HEIGHT"
        :print-line-chart-width="PRINT_LINE_CHART_WIDTH"
        :print-line-chart-height="PRINT_LINE_CHART_HEIGHT"
        @chart-ready="handleChartReady"
      />
    </div>
    
    <!-- Message si pas de données -->
    <div v-else-if="currentTheme && !getLayoutForTheme(currentTheme)" class="no-data-message">
      <p>Aucune donnée disponible pour cette thématique.</p>
    </div>

    <!-- Pied de page document -->
    <PrintFooter :date="formatDate(new Date())" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import PrintThemePage from '@/components/Print/PrintThemePage.vue'
import PrintCoverPage from '@/components/Print/PrintCoverPage.vue'
import PrintContextPage from '@/components/Print/PrintContextPage.vue'
import PrintFooter from '@/components/Print/PrintFooter.vue'
import { useCommuneData } from '@/composables/useCommuneData'
import { useCommuneCharts } from '@/composables/useCommuneCharts'
import { useDynamicPrintLayout } from '@/composables/useDynamicPrintLayout'
import { useMapData } from '@/composables/useMapData'
import { usePrintReady } from '@/composables/usePrintReady'
import { useThemeKPIs } from '@/composables/useThemeKPIs'
import { formatDate } from '@/utils/printFormatters'
import { PRINT_CHART_DIMENSIONS } from '@/utils/printChartHelpers'
import { themes } from '@/config/indicatorsConfig'
import { SHOW_COMMUNE_KEY_INDICATORS } from '@/config/featureFlags'
import { defaultInseeDepartment } from '@/config/site'

const route = useRoute()

// Dimensions optimisées pour format A4 paysage avec 4 graphiques par page (grille 2x2)
const PRINT_DONUT_WIDTH = PRINT_CHART_DIMENSIONS.DONUT.width
const PRINT_DONUT_HEIGHT = PRINT_CHART_DIMENSIONS.DONUT.height
const PRINT_BAR_WIDTH = PRINT_CHART_DIMENSIONS.BAR.width
const PRINT_BAR_HEIGHT = PRINT_CHART_DIMENSIONS.BAR.height
const PRINT_LINE_CHART_WIDTH = PRINT_CHART_DIMENSIONS.LINE.width
const PRINT_LINE_CHART_HEIGHT = PRINT_CHART_DIMENSIONS.LINE.height

/** Code INSEE normalisé (params peut être string | string[]) */
const codeInsee = computed(() => {
  const p = route.params.codeInsee
  const s = Array.isArray(p) ? p[0] : p
  return typeof s === 'string' ? s : ''
})

const themeId = computed(() => {
  const q = route.query.theme
  if (Array.isArray(q)) return q[0]
  return q
})

const showAllThemes = computed(() => route.query.all === 'true' || themeId.value === 'all')

type GeoJsonFeatureCollection = { features?: unknown[] } | null
const communesGeoJson = ref<GeoJsonFeatureCollection>(null)

// Données de la commune
const { loading, communeData, loadCommuneData } = useCommuneData(codeInsee)
const { chartData, evolutionData, loadChartData, getChartTypeForTheme } = useCommuneCharts(
  codeInsee,
  communeData
)
const { loadCommunesData } = useMapData()

// Système de layout dynamique
const { getLayoutForTheme, countChartsInLayout } = useDynamicPrintLayout(chartData, evolutionData)

// Helper pour obtenir les KPIs d'un thème
const activeThemeForKPIs = ref('demographie')
const { getKPIsForTheme } = useThemeKPIs(activeThemeForKPIs, chartData)

// Gestion de l'état "ready"
const {
  isReady,
  handleMapReady,
  handleChartReady,
  setExpectedCharts,
  setupSafetyTimeout,
  mapReady,
  chartsReady
} = usePrintReady()

/** Données graphiques par thème pour les props Print (typage explicite pour vue-tsc) */
function themeChartPayload(themeId: string): Record<string, any> {
  const raw = chartData.value[themeId]
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, any>
  return {}
}

// Thème actuel
const currentTheme = computed(() => {
  const tid = themeId.value
  if (!tid || tid === 'all') return null
  return themes[tid] ?? null
})

// Liste des thématiques à afficher dans l'export
const availableThemes = computed(() => {
  return Object.values(themes).filter(theme => {
    const themeData = chartData.value[theme.id]
    // Vérifier si le thème a des données (objet avec au moins une propriété non vide)
    if (!themeData) return false
    // Vérifier si c'est un objet avec des données
    if (typeof themeData === 'object' && !Array.isArray(themeData)) {
      return Object.keys(themeData).length > 0 && Object.values(themeData).some(data => 
        Array.isArray(data) && data.length > 0
      )
    }
    // Fallback pour les tableaux (ancienne structure)
    return Array.isArray(themeData) && themeData.length > 0
  })
})

// Calculer le nombre de graphiques attendus
const calculateExpectedCharts = () => {
  try {
    if (showAllThemes.value) {
      const total = availableThemes.value.reduce((sum, theme) => {
        const layout = getLayoutForTheme(theme)
        const count = layout ? countChartsInLayout(layout) : 0
        return sum + count
      }, 0)
      return total
    } else if (currentTheme.value) {
      const layout = getLayoutForTheme(currentTheme.value)
      const count = layout ? countChartsInLayout(layout) : 0
      return count
    }
    return 0
  } catch (error) {
    console.error('❌ [CommunePrint] Erreur calcul graphiques attendus:', error)
    return 0
  }
}

onMounted(async () => {
  // Démarrer le timeout de sécurité immédiatement pour que .print-ready soit toujours
  // ajouté au plus tard après 15s (évite échec Puppeteer si loadCommuneData/loadChartData échouent)
  setupSafetyTimeout(5000)

  try {
    await loadCommuneData()
    await loadChartData()
  } catch (error: any) {
    console.error('❌ [CommunePrint] Erreur chargement données commune/charts:', error)
    // On continue : on marquera 0 graphiques attendus et le timeout forcera le ready
  }

  // Charger les données géographiques pour la carte
  try {
    const geoData = (await loadCommunesData(defaultInseeDepartment())) as GeoJsonFeatureCollection
    if (!geoData?.features?.length) {
      console.error('❌ [CommunePrint] GeoJSON vide ou invalide !')
      communesGeoJson.value = null
    } else {
      communesGeoJson.value = geoData
    }
  } catch (error: any) {
    console.error('❌ [CommunePrint] Erreur chargement données géo:', error)
    communesGeoJson.value = null
  }

  await nextTick()

  // Calculer le nombre de graphiques attendus
  const expectedCount = calculateExpectedCharts()
  setExpectedCharts(expectedCount)

  // Si aucun graphique n'est attendu, marquer la carte comme prête et vérifier le ready
  if (expectedCount === 0) {
    if (!mapReady.value) {
      mapReady.value = true
    }
    setTimeout(() => {
      if (!isReady.value) {
        isReady.value = true
      }
    }, 1000)
  } else {
    setTimeout(() => {
      if (!isReady.value) {
        isReady.value = true
      }
    }, 2000)
  }
})

// Recalcule le nombre de graphiques à chaque fois que les dépendances évoluent
watch(
  [showAllThemes, currentTheme, () => chartData.value, () => evolutionData.value.length],
  () => {
    setExpectedCharts(calculateExpectedCharts())
  },
  { deep: true }
)
</script>

<style scoped>
/* Conteneur principal et états : styles délégués aux sous-composants (PrintContextPage, PrintFooter) */
.commune-print {
  width: 100%;
  max-width: 297mm;
  margin: 0 auto;
  padding: 0;
  background: white;
  font-family: 'Lato', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

.print-themes,
.print-single-theme {
  margin-bottom: 40px;
  page-break-inside: avoid;
}

.no-data-message p {
  margin: 0;
  color: #666;
}

/* Indicateur de chargement (caché une fois prêt) */
.commune-print:not(.print-ready)::before {
  content: 'Chargement des graphiques...';
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px 40px;
  border-radius: 8px;
  font-size: 18px;
  z-index: 9999;
}

@media screen and (max-width: 768px) {
  .commune-print {
    max-width: 100%;
    padding: 16px;
  }
}

@media screen and (max-width: 480px) {
  .commune-print {
    padding: 12px;
  }
}

@media print {
  .commune-print {
    padding: 0;
    margin: 0;
  }

  .commune-print:not(.print-ready)::before {
    display: none !important;
    content: none !important;
  }
}
</style>

