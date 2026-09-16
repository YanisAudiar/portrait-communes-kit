<template>
  <div class="commune-detail">
    <!-- Sticky header mobile : apparaît au scroll -->
    <StickyMobileHeader
      :commune-name="communeData?.nom || 'Commune'"
      :theme-name="currentThemeName"
      :theme-color="currentThemeColor"
    />

    <main class="commune-main" v-if="!loading">
      <!-- Bandeau page détail : titre + sélecteur + Explorer + logo, puis nom commune -->
      <CommuneDetailBanner
        :commune-data="communeData"
        :code-insee="codeInsee"
      />


      <!-- Sélecteur de thématique (horizontal, compact) -->
      <ThemeBanner
        :active-theme-id="activeTheme"
        :scroll-progress="scrollProgress"
        unified-active-style
        @theme-selected="handleThemeSelected"
      />

      <!-- Bandeau "Données provisoires" pour la thématique Économie-Emploi -->
      <!-- <section
        v-if="activeTheme === 'economie-emploi' && hasDataForActiveTheme"
        class="theme-provisional-banner"
        aria-label="Données provisoires"
      >
        <span class="theme-provisional-banner-text">Données provisoires</span>
      </section> -->

      <!-- Onglets de sous-thématiques (uniquement si la thématique a des données) -->
      <div v-if="hasDataForActiveTheme && subthemes.length > 1" class="subthemes-buttons-container subthemes-tab-panel">
        <button
          v-for="(subtheme, index) in subthemes"
          :key="subtheme"
          class="subtheme-button subtheme-tab"
          :class="{
            active: selectedSubtheme === subtheme,
            'tab-first': index === 0,
            'tab-last': index === subthemes.length - 1
          }"
          :title="`${getIndicatorsCountForSubtheme(subtheme)} indicateur(s) dans cette sous-thématique`"
          @click="onSubthemeSelected(subtheme)"
        >
          {{ subtheme }}
        </button>
      </div>

      <!-- Thématiques sans données : message unique (Energie-Environnement, Mobilités, Equipement et services) -->
      <section
        v-if="!hasDataForActiveTheme"
        class="theme-no-data-section"
        aria-label="Données à venir"
      >
        <div class="theme-no-data-content">
          <p class="theme-no-data-message">
            Les données pour cette thématique seront prochainement disponibles.
          </p>
          <p class="theme-no-data-hint">
            Les indicateurs et graphiques pour « {{ currentThemeName }} » sont en cours de préparation.
          </p>
        </div>
      </section>

      <!-- Bloc "Indicateurs clés" (KPIs) — désactivable via featureFlags -->
      <CommuneKeyIndicatorsSection
        v-if="SHOW_COMMUNE_KEY_INDICATORS && hasDataForActiveTheme"
        :displayed-k-p-is="displayedKPIs"
        :active-theme="activeTheme"
        :code-insee="codeInsee"
        :selected-subtheme="selectedSubtheme"
      />

      <!-- Bloc "Graphiques" – masqué pour les thèmes sans données -->
      <CommuneChartsSection
        v-if="hasDataForActiveTheme"
        :charts-config="chartsConfig"
        :current-theme-name="chartsSectionDisplayName"
        :code-insee="codeInsee"
        :active-theme="activeTheme"
        :chart-selected-years="chartSelectedYears"
        :get-comparison-fetch-fn="getComparisonFetchFn"
        @year-changed="handleYearChanged"
        @comparison-changed="handleComparisonChanged"
      />

      <!-- Pour en savoir plus : liens du thème actif (config/dashboard/links) -->
      <section class="pour-en-savoir-plus-section" aria-label="Pour en savoir plus">
        <PourEnSavoirPlus :theme-id="activeTheme" />
      </section>
    </main>

    <!-- Footer : même style que la page Landing -->
    <footer class="commune-detail-footer">
      <div class="commune-detail-footer-grid">
        <div class="footer-col footer-left">
          <nav class="footer-links">
            <a :href="agency.contactUrl" target="_blank" rel="noopener noreferrer">Contacts</a>
            <router-link to="/mentions-legales">Mentions légales</router-link>
            <ManageCookiesLink />
          </nav>
        </div>
        <div class="footer-col footer-right">
          <p class="footer-audiar-title">{{ agency.shortName }}</p>
          <p v-for="line in agency.addressLines" :key="line">{{ line }}</p>
          <p>T. {{ agency.phone }}</p>
          <a :href="agency.website" target="_blank" rel="noopener noreferrer">{{ agency.websiteLabel }}</a>
        </div>
      </div>
    </footer>

    <!-- Loading state with skeleton -->
    <div v-if="loading" class="loading-state">
      <div class="loading-skeletons">
        <SkeletonLoader type="card" :lines="4" />
        <SkeletonLoader type="list" :items="3" />
        <SkeletonLoader type="chart" />
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-state">
      <div class="error-content">
        <h3 class="title-b">❌ Erreur</h3>
        <p class="content">{{ error }}</p>
        <button @click="goBack" class="btn-primary">Retour</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeBanner from '@/components/Commune/ThemeBanner.vue'
import CommuneDetailBanner from '@/components/Commune/CommuneDetailBanner.vue'
import StickyMobileHeader from '@/components/Commune/StickyMobileHeader.vue'
import CommuneKeyIndicatorsSection from '@/components/Commune/CommuneKeyIndicatorsSection.vue'
import CommuneChartsSection from '@/components/Commune/CommuneChartsSection.vue'
import SkeletonLoader from '@/components/Common/SkeletonLoader.vue'
import ManageCookiesLink from '@/components/Common/ManageCookiesLink.vue'
import PourEnSavoirPlus from '@/components/Layout/PourEnSavoirPlus.vue'
import { useCommuneData } from '@/composables/useCommuneData'
import { useCommuneCharts } from '@/composables/useCommuneCharts'
import { useThemeCharts } from '@/composables/useThemeCharts'
import { useThemeKPIs } from '@/composables/useThemeKPIs'
import { useCommuneDetailRouteSync } from '@/composables/useCommuneDetailRouteSync'
import {
  themes,
  getIndicatorsByTheme,
  sortSubthemesByTheme,
  isThemeWithoutData
} from '@/config/indicatorsConfig'
import { SHOW_COMMUNE_KEY_INDICATORS } from '@/config/featureFlags'
import { siteConfig } from '@/config/site'
import { api } from '@/services/api'
import '@/assets/css/views/commune-detail.css'

const agency = siteConfig.agency

const props = defineProps({
  codeInsee: {
    type: String,
    required: true
  }
})

const router = useRouter()
const scrollProgress = ref(0)

const {
  activeTheme,
  selectedSubtheme,
  handleThemeSelected,
  onSubthemeSelected
} = useCommuneDetailRouteSync()

const chartSelectedYears = ref({})

const currentThemeName = computed(() => themes[activeTheme.value]?.label || 'Démographie')
const currentThemeColor = computed(() => themes[activeTheme.value]?.color || '#0A3D62')
const hasDataForActiveTheme = computed(() => !isThemeWithoutData(activeTheme.value))
const chartsSectionDisplayName = computed(() => selectedSubtheme.value || currentThemeName.value)

const themeIndicators = computed(() => getIndicatorsByTheme(activeTheme.value))
const subthemes = computed(() => {
  const subthemesList = [...new Set(themeIndicators.value.map(ind => ind.subtheme).filter(Boolean))]
  return sortSubthemesByTheme(activeTheme.value, subthemesList)
})

const { loading, error, communeData, loadCommuneData } = useCommuneData(props.codeInsee)
const { chartData, evolutionData, loadChartData } = useCommuneCharts(props.codeInsee, communeData)
const { currentKPIs } = useThemeKPIs(activeTheme, chartData, selectedSubtheme)
const { getChartsForTheme } = useThemeCharts(activeTheme, chartData, evolutionData, currentThemeName, selectedSubtheme)

const chartsConfig = computed(() => getChartsForTheme())

const displayedKPIs = computed(() => {
  const limit = selectedSubtheme.value === 'Ménages' ? 4 : 3
  return currentKPIs.value.slice(0, limit)
})

const goBack = () => {
  router.push('/')
}

const getIndicatorsCountForSubtheme = (subtheme) => {
  return themeIndicators.value.filter(ind => ind.subtheme === subtheme).length
}

const handleYearChanged = (chartId, year) => {
  chartSelectedYears.value[chartId] = year
}

const getComparisonFetchFn = (chartItem) => {
  if (chartItem.id?.startsWith('demo-')) {
    return async (codeInsee) => {
      const response = await api.getCommuneDemographics(codeInsee)
      if (response?.evolution_population) {
        return response.evolution_population
      }
      return response
    }
  }
  return null
}

const handleComparisonChanged = (_chartId, _territories) => {
  // Gestion silencieuse des changements de comparaison
}

// Initialiser la premiere sous-thematique au chargement et quand le theme change
watch([subthemes, activeTheme], ([newSubthemes, _newTheme]) => {
  if (newSubthemes.length > 0 && !selectedSubtheme.value) {
    selectedSubtheme.value = newSubthemes[0]
  }
}, { immediate: true })

onMounted(async () => {
  await loadCommuneData()
  await loadChartData()

  if (subthemes.value.length > 0 && !selectedSubtheme.value) {
    selectedSubtheme.value = subthemes.value[0]
  }
})
</script>
