<template>
  <div class="communes-panel">
    <header class="panel-header">
      <div class="header-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 100 12A6 6 0 0010 2zM2 16a8 8 0 0116 0v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1z" />
        </svg>
      </div>
      <div class="header-text">
        <h3 class="title-b">Communes</h3>
        <p class="description">Cliquez pour accéder à la fiche détaillée</p>
      </div>
      <span class="badge" v-if="formattedCommunes.length">{{ formattedCommunes.length }}</span>
    </header>

    <div class="select-container">
      <label class="select-label" for="communes-select">Choisir une commune</label>
      <p class="helper-text">
        Sélectionnez une commune pour ouvrir automatiquement sa fiche détaillée.
      </p>
      <div class="select-wrapper">
        <select
          id="communes-select"
          class="communes-select"
          :disabled="isLoading || formattedCommunes.length === 0"
          v-model="selectedCode"
          @change="handleSelection"
        >
          <option value="" disabled>-- Sélectionnez une commune --</option>
          <option
            v-for="commune in formattedCommunes"
            :key="commune.code"
            :value="commune.code"
          >
            {{ commune.name }} ({{ commune.code }})
          </option>
        </select>
        <span class="select-arrow" aria-hidden="true">▾</span>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <span class="spinner" aria-hidden="true"></span>
      <span>Chargement des communes…</span>
    </div>

    <div v-else-if="formattedCommunes.length === 0" class="empty-state">
      <p>Aucune commune disponible pour le moment.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCommuneStore } from '@/stores'
import { getFeatureCode, getFeatureName } from '@/utils/mapHelpers'

interface Commune {
  code: string
  name: string
  hasData: boolean
}

const router = useRouter()
const communeStore = useCommuneStore()

const isLoading = computed<boolean>(() => Boolean(communeStore.loading))

const formattedCommunes = computed<Commune[]>(() => {
  const list = Array.isArray(communeStore.communes) ? communeStore.communes : []

  return list
    .map((feature: any) => {
      const code = getFeatureCode(feature)
      const name = getFeatureName(feature)
      return {
        code,
        name,
        hasData: Boolean(feature?.properties?.has_data)
      }
    })
    .filter((commune: Commune) => Boolean(commune.code) && Boolean(commune.name))
    .sort((a: Commune, b: Commune) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
})

const selectedCode = ref<string>('')

watch(
  () => communeStore.selectedCommuneCode,
  (code) => {
    selectedCode.value = code ?? ''
  },
  { immediate: true }
)

watch(
  () => formattedCommunes.value,
  (list) => {
    if (list.length === 0) {
      selectedCode.value = ''
      return
    }
    const exists = list.some((commune) => commune.code === selectedCode.value)
    if (!exists) {
      selectedCode.value = ''
    }
  },
  { deep: true }
)

const handleSelection = () => {
  if (!selectedCode.value) return
  router.push(`/commune/${selectedCode.value}`)
}
</script>

<style scoped>
.communes-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 24px;
  min-width: 0; /* Évite débordement horizontal en flex */
  max-width: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.7);
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #316d7b 0%, #1e2972 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(30, 41, 114, 0.2);
}

.header-text {
  flex: 1;
}

.description {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 6px 10px;
  border-radius: 9999px;
  background: rgba(49, 109, 123, 0.12);
  color: #316d7b;
  font-weight: 600;
  font-size: 13px;
}


.select-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.88) 100%);
  box-shadow:
    0 12px 32px rgba(17, 24, 39, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.select-label {
  font-size: 12px;
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.helper-text {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.select-wrapper {
  position: relative;
}

.communes-select {
  width: 100%;
  padding: 14px 46px 14px 18px;
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fb 100%);
  font-size: 15px;
  color: #111827;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  appearance: none;
  transition: all 0.25s ease;
  cursor: pointer;
  box-shadow: inset 0 2px 4px rgba(148, 163, 184, 0.18);
}

.communes-select:hover {
  border-color: rgba(49, 109, 123, 0.6);
  box-shadow:
    inset 0 2px 4px rgba(49, 109, 123, 0.08),
    0 6px 18px rgba(49, 109, 123, 0.12);
}

.communes-select:focus {
  outline: none;
  border-color: rgba(49, 109, 123, 0.95);
  box-shadow:
    0 0 0 5px rgba(49, 109, 123, 0.18),
    inset 0 2px 4px rgba(49, 109, 123, 0.12);
}

.communes-select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: inset 0 1px 2px rgba(148, 163, 184, 0.1);
}

.select-arrow {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #316d7b;
  font-size: 18px;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(17, 24, 39, 0.12);
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 16px;
  border-radius: 16px;
  border: 1px dashed rgba(209, 213, 219, 0.8);
  color: #6b7280;
  text-align: center;
  font-size: 14px;
}

.loading-state {
  border-style: solid;
  border-color: rgba(49, 109, 123, 0.2);
  color: #316d7b;
}

.spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid rgba(49, 109, 123, 0.2);
  border-top-color: #316d7b;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .communes-panel {
    gap: 20px;
  }
}
</style>

