<template>
  <div class="chart-compare-panel">
    <ChartComparePanelToggle
      :is-panel-open="isPanelOpen"
      @toggle-panel="togglePanel"
    />

    <Transition name="slide-fade">
      <div v-if="isPanelOpen" class="compare-panel-content">
        <ChartComparePanelSearch
          v-model="searchQuery"
          :filtered-communes="filteredCommunes"
          :show-dropdown="showDropdown"
          :comparison-codes="comparisonCodes"
          :main-commune-code="mainCommuneCode"
          @focus="showDropdown = true"
          @close-dropdown="showDropdown = false"
          @select="selectCommune"
        />

        <ChartCompareActions
          :can-add="canAdd"
          :comparison-count="comparisonCount"
          @add="handleAdd"
          @remove-last="handleRemove"
        />

        <ChartCompareTerritoryList
          :territories="comparisonTerritories"
          :colors="COMPARISON_COLORS"
          @remove="removeComparison"
        />

        <Transition name="fade">
          <div v-if="error" class="error-message">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {{ error }}
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="isMaxReached" class="limit-warning">
            Maximum {{ maxComparisons }} comparaisons atteint
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="loading" class="loading-indicator">
            <div class="spinner"></div>
            Chargement...
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * ChartComparePanel - Panneau de comparaison de territoires
 * Orchestre : recherche, actions, liste des comparaisons, messages d'état
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useCommuneStore } from '@/stores/communeStore'
import ChartComparePanelToggle from './ChartComparePanelToggle.vue'
import ChartComparePanelSearch from './ChartComparePanelSearch.vue'
import ChartCompareActions from './ChartCompareActions.vue'
import ChartCompareTerritoryList from './ChartCompareTerritoryList.vue'

type CommuneOption = { code: string; label: string }

const props = defineProps({
  isPanelOpen: { type: Boolean, default: false },
  comparisonTerritories: {
    type: Array as () => { code: string; label: string; data: any[] }[],
    default: () => []
  },
  comparisonCount: { type: Number, default: 0 },
  isMaxReached: { type: Boolean, default: false },
  canAddComparison: { type: Boolean, default: true },
  comparisonCodes: { type: Array as () => string[], default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  COMPARISON_COLORS: {
    type: Array as () => string[],
    default: () => ['#10B981', '#8B5CF6']
  },
  maxComparisons: { type: Number, default: 2 },
  mainCommuneCode: { type: String, default: '' }
})

const emit = defineEmits<{
  (e: 'toggle-panel'): void
  (e: 'add-comparison', code: string, label: string): void
  (e: 'remove-comparison', code: string): void
  (e: 'remove-last'): void
  (e: 'clear-error'): void
}>()

const communeStore = useCommuneStore()
const searchQuery = ref('')
const selectedCommune = ref<CommuneOption | null>(null)
const showDropdown = ref(false)
const allCommunes = ref<CommuneOption[]>([])

const filteredCommunes = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  const query = searchQuery.value.toLowerCase().trim()
  return allCommunes.value
    .filter(c => c.code !== props.mainCommuneCode && c.label.toLowerCase().includes(query))
    .slice(0, 10)
})

const canAdd = computed(
  () =>
    selectedCommune.value !== null &&
    props.canAddComparison &&
    !props.loading &&
    !props.comparisonCodes.includes(selectedCommune.value!.code)
)

function togglePanel() {
  emit('toggle-panel')
}

function selectCommune(commune: CommuneOption) {
  if (props.comparisonCodes.includes(commune.code)) return
  selectedCommune.value = commune
  searchQuery.value = commune.label
  showDropdown.value = false
}

function handleAdd() {
  if (!selectedCommune.value) return
  emit('add-comparison', selectedCommune.value.code, selectedCommune.value.label)
  searchQuery.value = ''
  selectedCommune.value = null
}

function handleRemove() {
  emit('remove-last')
}

function removeComparison(code: string) {
  emit('remove-comparison', code)
}

async function loadCommunes() {
  try {
    const response = await communeStore.fetchCommunesChoropleth({ bretagne: true })
    const features = response?.data?.features || response?.features || []
    if (features.length > 0) {
      allCommunes.value = features
        .map((f: any) => ({
          code: f.properties?.code_insee_concat || f.properties?.code || '',
          label: f.properties?.lib_com || f.properties?.nom || ''
        }))
        .filter((c: CommuneOption) => c.code && c.label)
    }
  } catch (err) {
    console.error('❌ Erreur chargement communes:', err)
  }
}

watch(searchQuery, () => {
  showDropdown.value = searchQuery.value.length >= 2
})

onMounted(loadCommunes)

watch(
  () => props.isPanelOpen,
  isOpen => {
    if (!isOpen) emit('clear-error')
  }
)
</script>

<style scoped>
.chart-compare-panel {
  margin-top: 1rem;
}

.compare-panel-content {
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 0.813rem;
  color: #dc2626;
}

.error-message .icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.limit-warning {
  padding: 0.5rem 0.75rem;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #92400e;
  text-align: center;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  font-size: 0.813rem;
  color: #64748b;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .compare-panel-content {
    padding: 0.75rem;
  }
}
</style>
