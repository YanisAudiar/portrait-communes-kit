<template>
  <div class="dashboard">
    <AppHeader 
      :stats="headerStats"
      @info-click="showInfo"
      @settings-click="showSettings"
      class="animate-fade-in"
    />
    
    <main class="dashboard-main">
      <div class="dashboard-layout">
        <!-- Bandeau gauche -->
        <SidebarLeft
          class="animate-slide-in-left"
        />
        
        <!-- Zone centrale avec la carte -->
        <DashboardMapArea
          :selected-departement="selectedDepartement"
          :selected-indicateur="selectedIndicateur"
          @stats-updated="updateStats"
        />
        
        <!-- Bandeau droit désactivé pour l'affichage cartographique seul -->
      </div>
      <!-- Pour en savoir plus : juste sous le contenu, pas dans le footer -->
      <section class="pour-en-savoir-plus-section" aria-label="Pour en savoir plus">
        <PourEnSavoirPlus />
      </section>
    </main>
    
    <!-- Footer -->
    <DashboardFooter />
    
    <!-- Modals -->
    <InfoModal
      :show="showInfoModal"
      @close="closeModals"
    />
    
    <SettingsModal
      :show="showSettingsModal"
      v-model:map-theme="mapTheme"
      v-model:show-population="showPopulation"
      @close="closeModals"
    />
  </div>
</template>

<script setup>
import AppHeader from '@/components/Layout/AppHeader.vue'
import {
  SidebarLeft,
  InfoModal,
  SettingsModal,
  DashboardFooter,
  DashboardMapArea
} from '@/components/Dashboard'
import PourEnSavoirPlus from '@/components/Layout/PourEnSavoirPlus.vue'
import { useDashboardLayout } from '@/composables/useDashboardLayout'
import '@/assets/css/views/dashboard.css'

const {
  mapTheme,
  showPopulation,
  selectedDepartement,
  selectedIndicateur,
  headerStats,
  updateStats,
  showInfo,
  showSettings,
  closeModals,
  showInfoModal,
  showSettingsModal
} = useDashboardLayout()
</script>

