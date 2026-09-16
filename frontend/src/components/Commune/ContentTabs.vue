<template>
  <div class="content-tabs-wrapper">
    <!-- Navigation des onglets -->
    <TabsNavigation 
      :tabs="tabs"
      :active-tab="activeTab"
      @tab-change="selectTab"
    />

    <!-- Contenu des onglets -->
    <div class="tabs-content">
      <!-- Onglet Dataviz -->
      <TabPanel tab-id="dataviz" :is-active="activeTab === 'dataviz'">
        <DatavizPanel :theme-name="currentThemeName">
          <slot name="dataviz" />
        </DatavizPanel>
      </TabPanel>

      <!-- Onglet Tableau -->
      <TabPanel tab-id="tableau" :is-active="activeTab === 'tableau'">
        <TableauPanel 
          :indicator-name="selectedIndicatorName"
          :table-data="tableData"
        >
          <slot name="tableau" />
        </TableauPanel>
      </TabPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Composant ContentTabs - Système d'onglets pour afficher différents contenus
 * Refactorisé pour respecter la limite de 200 lignes par composant
 * Utilise des sous-composants pour la modularité
 */
import { ref, watch } from 'vue'
import TabsNavigation from './TabsNavigation.vue'
import TabPanel from './TabPanel.vue'
import DatavizPanel from './DatavizPanel.vue'
import TableauPanel from './TableauPanel.vue'

interface TableRow {
  id: number | string
  label: string
  value: string | number
  unit?: string
  year?: string
  [key: string]: any
}

// Props
const props = defineProps({
  defaultTab: {
    type: String,
    default: 'dataviz'
  },
  currentThemeName: {
    type: String,
    default: 'Démographie'
  },
  selectedIndicatorName: {
    type: String,
    default: null
  },
  tableData: {
    type: Array as () => TableRow[],
    default: () => [
      { id: 1, label: 'Exemple de donnée 1', value: '1234', unit: 'habitants', year: '2022' },
      { id: 2, label: 'Exemple de donnée 2', value: '56.7', unit: '%', year: '2022' },
      { id: 3, label: 'Exemple de donnée 3', value: '789', unit: 'unités', year: '2022' }
    ]
  }
})

// Emits
const emit = defineEmits<{
  (e: 'tab-changed', tabId: string): void
}>()

// État local
const activeTab = ref(props.defaultTab)

// Configuration des onglets
const tabs = [
  { 
    id: 'dataviz', 
    label: 'Dataviz', 
    icon: '📊'
  },
  { 
    id: 'tableau', 
    label: 'Tableau', 
    icon: '📋'
  }
]

/**
 * Changer d'onglet
 */
const selectTab = (tabId: string) => {
  if (activeTab.value !== tabId) {
    activeTab.value = tabId
    emit('tab-changed', tabId)
  }
}

/**
 * Watcher pour détecter les changements de l'onglet par défaut
 */
watch(() => props.defaultTab, (newTab) => {
  activeTab.value = newTab
})

// Exposer des méthodes pour utilisation externe
defineExpose({
  selectTab
})
</script>

<style scoped>
.content-tabs-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
}

.tabs-content {
  flex: 1;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(241, 126, 8, 0.3) transparent;
}

.tabs-content::-webkit-scrollbar {
  width: 6px;
}

.tabs-content::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-content::-webkit-scrollbar-thumb {
  background: rgba(241, 126, 8, 0.3);
  border-radius: 3px;
}

.tabs-content::-webkit-scrollbar-thumb:hover {
  background: rgba(241, 126, 8, 0.5);
}
</style>

