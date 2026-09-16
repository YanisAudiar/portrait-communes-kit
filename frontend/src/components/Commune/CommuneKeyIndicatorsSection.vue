<template>
  <section class="key-indicators-section">
    <div
      class="kpi-section"
      :class="{ 'kpi-section-4-cols': isMenagesAndFourCols }"
    >
      <KPICard
        v-for="(kpi, index) in displayedKPIs"
        :key="kpi.id || index"
        :value="kpi.value"
        :label="kpi.label"
        :icon="kpi.icon"
        :format="kpi.format"
        :decimals="kpi.decimals"
        :id-kpi="kpi.id"
        :theme="activeTheme"
        :territoire="codeInsee"
        :benchmark-r-m="kpi.benchmarkRM"
        :benchmark-label="kpi.benchmarkLabel"
        :value-display-override="kpi.valueDisplayOverride"
        :visually-hidden="kpi.visuallyHidden"
      />
    </div>
  </section>
</template>

<script setup>
import KPICard from '@/components/Commune/KPICard.vue'
import { computed } from 'vue'

const props = defineProps({
  /** Liste des KPIs à afficher (déjà limitée par le parent) */
  displayedKPIs: {
    type: Array,
    required: true
  },
  /** Thème actif pour le style des cartes */
  activeTheme: {
    type: String,
    default: 'demographie'
  },
  /** Code Insee du territoire */
  codeInsee: {
    type: String,
    required: true
  },
  /** Sous-thématique sélectionnée (pour la classe 4 colonnes "Ménages") */
  selectedSubtheme: {
    type: String,
    default: null
  }
})

const isMenagesAndFourCols = computed(
  () => props.selectedSubtheme === 'Ménages' && props.displayedKPIs.length === 4
)
</script>
