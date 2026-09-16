<template>
  <div class="share-page">
    <div v-if="loading" class="loading-overlay">
      <div class="loader"></div>
      <p>Chargement du graphique...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <h2>Oups !</h2>
        <p>{{ error }}</p>
        <router-link to="/" class="btn-home">Retour à l'accueil</router-link>
      </div>
    </div>

    <div v-else class="share-content">
      <ShareViewHeader :commune-name="communeName" />
      <ShareViewPreview
        :chart-config="chartConfig"
        :selected-kpi="selectedKpi"
        :id-kpi="idKpi"
        :height="height"
        :selected-year="selectedYear"
      />
      <ShareViewFooter :commune-link="communeLink" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/services/api'
import { getIndicatorById } from '@/config/indicatorsConfig'
import { createChartConfig } from '@/composables/useThemeCharts'
import type { ChartConfig } from '@/composables/useThemeCharts'
import { getKPIsForTheme } from '@/composables/kpis'
import type { KPI } from '@/composables/kpis'
import ShareViewHeader from '@/components/Share/ShareViewHeader.vue'
import ShareViewPreview from '@/components/Share/ShareViewPreview.vue'
import ShareViewFooter from '@/components/Share/ShareViewFooter.vue'

const route = useRoute()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const chartConfig = ref<ChartConfig | null>(null)
const selectedKpi = ref<KPI | null>(null)
const communeName = ref('')

// Params
const idChart = computed(() => route.query.idChart as string)
const idKpi = computed(() => route.query.idKpi as string)
const codeInsee = computed(() => route.query.territoire as string)
const themeId = computed(() => route.query.theme as string)
const selectedYear = computed(() => route.query.year ? Number(route.query.year) : null)

const height = ref(window.innerHeight * 0.6)

const communeLink = computed(() => `/commune/${codeInsee.value}`)

/**
 * Mappe un ID de thème vers la fonction API correspondante
 */
const getThemeData = async (theme: string, insee: string) => {
  if (!theme) return null

  switch (theme) {
    case 'demographie':
      return await api.getCommuneDemographics(insee)
    case 'habitat':
      return await api.getCommuneHousing(insee)
    case 'economie':
    case 'economie-emploi':
      return await api.getCommuneEconomy(insee)
    case 'formation':
    case 'enseignement':
      return await api.getCommuneFormation(insee)
    case 'solidarite':
      return await api.getCommuneSolidarite(insee)
    case 'agriculture':
      return await api.getCommuneAgriculture(insee)
    case 'energie-environnement':
    case 'environnement':
    case 'mobilites':
    case 'equipement-services':
      console.warn(`Thème "${theme}" demandé mais pas encore de route API dédiée.`)
      return null
    default:
      return null
  }
}

onMounted(async () => {
  if (!codeInsee.value || (!idChart.value && !idKpi.value)) {
    error.value = "Paramètres manquants dans l'URL (territoire + idChart ou idKpi)."
    loading.value = false
    return
  }

  try {
    const response = await api.getCommuneByCode(codeInsee.value)
    const props = response?.properties || response
    communeName.value = props?.nom || props?.lib_com || props?.NOM || codeInsee.value

    if (idChart.value) {
      const indicator = getIndicatorById(idChart.value)
      if (!indicator) {
        error.value = `Indicateur "${idChart.value}" introuvable.`
        loading.value = false
        return
      }

      const targetTheme = themeId.value || indicator.theme
      const themeData = await getThemeData(targetTheme, codeInsee.value)

      if (!themeData) {
        error.value = `Impossible de charger les données pour le thème "${targetTheme}".`
        loading.value = false
        return
      }

      const config = createChartConfig(indicator as any, themeData, targetTheme)
      if (!config) {
        error.value = "Impossible de générer le graphique (données vides ou format incorrect)."
      } else {
        chartConfig.value = config
      }
    } else if (idKpi.value) {
      if (!themeId.value) {
        error.value = "Le thème est requis pour partager un chiffre clé."
        loading.value = false
        return
      }

      const themeData = await getThemeData(themeId.value, codeInsee.value)
      if (!themeData) {
        error.value = `Impossible de charger les données pour le thème "${themeId.value}".`
        loading.value = false
        return
      }

      const kpis = getKPIsForTheme(themeId.value, themeData)
      const kpi = kpis.find(k => k.id === idKpi.value)

      if (!kpi) {
        error.value = `Chiffre clé "${idKpi.value}" introuvable pour ce territoire.`
      } else {
        selectedKpi.value = kpi
      }
    }
  } catch (err: any) {
    console.error('ShareView Error:', err)
    error.value = api.handleError(err)
  } finally {
    loading.value = false
  }
})

const onResize = () => {
  height.value = window.innerHeight * 0.6
}

window.addEventListener('resize', onResize)

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.share-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1e293b;
}

.share-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
}

/* Loading & Error */
.loading-overlay,
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #e2e8f0;
  border-bottom-color: #316d7b;
  border-radius: 50%;
  animation: rotation 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.error-card h2 {
  color: #ef4444;
  margin-bottom: 1rem;
}

.btn-home {
  display: inline-block;
  margin-top: 1.5rem;
  background: #316d7b;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

@media (max-width: 640px) {
  .share-content {
    padding: 1rem;
  }
}
</style>
