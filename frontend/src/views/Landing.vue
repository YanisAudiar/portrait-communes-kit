<template>
  <div class="landing">
    <LandingHeader />

    <!-- Contenu principal : carte + sélecteur -->
    <main class="landing-main">
      <div class="landing-container">
        <div class="landing-layout" :class="{ 'landing-layout--no-map': !showLandingMap }">
          <!-- Carte : masquée sur smartphone (≤768px) — rendu trop compact, panneau seul en pleine largeur -->
          <section
            v-if="showLandingMap"
            class="landing-map"
            aria-label="Carte des communes"
          >
            <DashboardMapArea
              :selected-departement="defaultDepartement"
              :selected-indicateur="defaultIndicateur"
              map-layout="landing"
              @stats-updated="onStatsUpdate"
            />
          </section>
          <!-- Panneau de sélection à droite (ou plein écran sur mobile sans carte) -->
          <CommunesListSidebar class="landing-panel" />
        </div>
      </div>
    </main>

    <!-- Footer : même grille que le layout pour alignement parfait -->
    <footer class="landing-footer">
      <div class="landing-footer-grid">
        <div class="footer-col footer-left">
          <p class="footer-dev">
            Ce site est développé par {{ agency.name }}
            <br />© {{ territory.productTitle }}
          </p>
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
  </div>
</template>

<script setup lang="ts">
/**
 * Landing - Page d'accueil Portraits de communes
 * Design : header bleu, carte + sélecteur de commune, footer bleu
 */
import { ref, onMounted, onUnmounted } from 'vue'
import ManageCookiesLink from '@/components/Common/ManageCookiesLink.vue'
import { useCommuneStore } from '@/stores'
import LandingHeader from '@/components/Layout/LandingHeader.vue'
import DashboardMapArea from '@/components/Dashboard/DashboardMapArea.vue'
import CommunesListSidebar from '@/components/Landing/CommunesListSidebar.vue'
import { siteConfig } from '@/config/site'
import '@/assets/css/views/landing.css'

/** Aligné sur mapHelpers.isMobileDevice : pas de carte en dessous de cette largeur */
const LANDING_MAP_MIN_WIDTH_PX = 769

const communeStore = useCommuneStore()
const agency = siteConfig.agency
const territory = siteConfig.territory

/** Afficher la carte seulement sur tablette / desktop (évite MapLibre + layout compact sur smartphone) */
const showLandingMap = ref(
  typeof window !== 'undefined'
    ? window.matchMedia(`(min-width: ${LANDING_MAP_MIN_WIDTH_PX}px)`).matches
    : true
)

const defaultDepartement = siteConfig.territory.inseeDepartment || ''
const defaultIndicateur = 'nb_menages'

function onStatsUpdate() {
  // Optionnel : synchroniser les stats si besoin
}

/** Nettoyage du listener matchMedia (enregistré dans onMounted) */
let removeLandingMapMediaListener = () => {}

onMounted(async () => {
  const mq = window.matchMedia(`(min-width: ${LANDING_MAP_MIN_WIDTH_PX}px)`)
  const syncMapVisibility = () => {
    showLandingMap.value = mq.matches
  }
  syncMapVisibility()
  mq.addEventListener('change', syncMapVisibility)
  removeLandingMapMediaListener = () => mq.removeEventListener('change', syncMapVisibility)

  if (!communeStore.communes?.length) {
    try {
      await communeStore.fetchCommunesChoropleth({ bretagne: true })
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('Chargement des communes (landing):', e)
      }
    }
  }
})

onUnmounted(() => removeLandingMapMediaListener())
</script>
