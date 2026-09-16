<template>
  <section class="territory-banner">
    <div class="territory-banner-content">
      <!-- Logo agence + lien retour accueil explicite -->
      <router-link to="/" class="territory-logo" aria-label="Retour à l'accueil" title="Retour à l'accueil">
        <img
          v-if="!logoError"
          src="@/assets/images/logo-Audiar.svg"
          :alt="agency.name"
          class="territory-logo-img"
          @error="logoError = true"
        />
        <span v-else class="territory-logo-fallback">{{ agency.name }}</span>
        <span class="territory-back-label">Accueil</span>
      </router-link>
      <!-- Icône + nom + infos commune -->
      <div class="territory-icon">
        {{ getDepartmentIcon(communeData?.departement) }}
      </div>
      <div class="territory-info">
        <h2 class="territory-name">{{ communeData?.nom || 'Commune' }}</h2>
        <div class="territory-meta">
          <span class="territory-code">{{ codeInsee }}</span>
          <span v-if="communeData?.departement" class="territory-separator">&bull;</span>
          <span v-if="communeData?.departement" class="territory-department">{{ getDepartmentName(communeData.departement) }}</span>
        </div>
      </div>

      <!-- Desktop : actions visibles en ligne -->
      <div class="territory-actions territory-actions-desktop">
        <div class="territory-communes-select-wrapper">
          <label for="territory-communes-select-desktop" class="sr-only">Changer de commune</label>
          <select
            id="territory-communes-select-desktop"
            v-model="selectedCode"
            class="territory-communes-select"
            aria-label="Liste des communes"
            :disabled="isLoading || formattedCommunes.length === 0"
            @change="handleCommuneChange"
          >
            <option value="" disabled>Choisir une commune</option>
            <option
              v-for="commune in formattedCommunes"
              :key="commune.code"
              :value="commune.code"
            >
              {{ commune.name }} ({{ commune.code }})
            </option>
          </select>
          <span class="territory-select-arrow" aria-hidden="true">▾</span>
        </div>
        <div v-if="$slots.actions" class="territory-actions-slot">
          <slot name="actions" />
        </div>
      </div>

      <!-- Mobile : bouton overflow ⋮ pour accéder aux actions -->
      <button
        class="territory-overflow-btn"
        aria-label="Plus d'options"
        @click="toggleMobileMenu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
    </div>

    <!-- Mobile : panneau d'actions dépliable -->
    <transition name="slide-down">
      <div v-if="mobileMenuOpen" class="territory-mobile-panel">
        <div class="territory-mobile-select-wrapper">
          <label for="territory-communes-select-mobile" class="territory-mobile-label">Changer de commune</label>
          <div class="territory-communes-select-wrapper">
            <select
              id="territory-communes-select-mobile"
              v-model="selectedCode"
              class="territory-communes-select"
              aria-label="Liste des communes"
              :disabled="isLoading || formattedCommunes.length === 0"
              @change="handleCommuneChange"
            >
              <option value="" disabled>Choisir une commune</option>
              <option
                v-for="commune in formattedCommunes"
                :key="commune.code"
                :value="commune.code"
              >
                {{ commune.name }} ({{ commune.code }})
              </option>
            </select>
            <span class="territory-select-arrow" aria-hidden="true">▾</span>
          </div>
        </div>
        <div v-if="$slots.actions" class="territory-mobile-actions">
          <slot name="actions" />
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCommuneStore } from '@/stores'
import { getFeatureCode, getFeatureName } from '@/utils/mapHelpers'
import { siteConfig } from '@/config/site'

const agency = siteConfig.agency

interface Commune {
  code: string
  name: string
}

const props = defineProps({
  communeData: {
    type: Object,
    default: null
  },
  codeInsee: {
    type: String,
    required: true
  }
})

const router = useRouter()
const communeStore = useCommuneStore()

const logoError = ref(false)
const selectedCode = ref(props.codeInsee)
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

watch(
  () => props.codeInsee,
  (code) => {
    selectedCode.value = code
  }
)

const isLoading = computed(() => Boolean(communeStore.loading))

const formattedCommunes = computed<Commune[]>(() => {
  const list = Array.isArray(communeStore.communes) ? communeStore.communes : []
  return list
    .map((feature: { properties?: { code?: string; nom?: string; code_insee_concat?: string } }) => ({
      code: getFeatureCode(feature),
      name: getFeatureName(feature)
    }))
    .filter((c: Commune) => Boolean(c.code) && Boolean(c.name))
    .sort((a: Commune, b: Commune) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
})

function handleCommuneChange() {
  if (!selectedCode.value) return
  router.push(`/commune/${selectedCode.value}`)
}

onMounted(async () => {
  if (!communeStore.communes?.length) {
    try {
      await communeStore.fetchCommunesChoropleth({ bretagne: true })
    } catch (_e) {
      // ignore
    }
  }
  selectedCode.value = props.codeInsee
})

const getDepartmentName = (dept: string): string => {
  const departments: Record<string, string> = {
    '22': 'Côtes-d\'Armor',
    '29': 'Finistère', 
    '35': 'Ille-et-Vilaine',
    '56': 'Morbihan'
  }
  return departments[dept] || `Département ${dept}`
}

const getDepartmentIcon = (dept: string): string => {
  const icons: Record<string, string> = {
    '22': '🌊',
    '29': '🏰',
    '35': '🌳', 
    '56': '⛵'
  }
  return icons[dept] || '🏛️'
}
</script>

<style scoped>
.territory-banner {
  margin-bottom: 24px;
}

.territory-banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.territory-logo {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--text-primary, #316d7b);
  gap: 2px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.territory-logo:hover {
  background: rgba(10, 61, 98, 0.05);
}

.territory-logo-img {
  height: 36px;
  width: auto;
}

.territory-logo-fallback {
  font-weight: 700;
  font-size: 1rem;
}

/* Label "Accueil" sous le logo — toujours visible, discret */
.territory-back-label {
  font-size: 10px;
  font-weight: 500;
  color: #0A3D62;
  letter-spacing: 0.02em;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.territory-logo:hover .territory-back-label {
  opacity: 1;
}

.territory-icon {
  font-size: 32px;
  line-height: 1;
  flex-shrink: 0;
}

.territory-info {
  flex: 1;
  min-width: 0;
}

/* Bouton overflow mobile ⋮ — caché sur desktop */
.territory-overflow-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 8px;
  background: white;
  color: #475569;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.territory-overflow-btn:hover {
  background: #f1f5f9;
  color: #0A3D62;
}

.territory-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.territory-communes-select-wrapper {
  position: relative;
  min-width: 180px;
}

.territory-communes-select {
  padding: 0.5rem 2rem 0.5rem 0.65rem;
  font-size: 0.875rem;
  color: var(--text-primary, #316d7b);
  background: #fff;
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: 8px;
  appearance: none;
  cursor: pointer;
  width: 100%;
}

.territory-communes-select:focus {
  outline: none;
  border-color: var(--primary-blue, #1e2972);
}

.territory-communes-select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.territory-select-arrow {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-secondary, #5a6c7d);
  font-size: 0.75rem;
}

.territory-actions-slot {
  display: flex;
  align-items: center;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.territory-name {
  font-size: 20px;
  font-weight: 700;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #323F4B;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.territory-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.territory-code {
  font-weight: 600;
  color: #475569;
}

.territory-separator {
  color: #cbd5e1;
}

.territory-department {
  color: #6b7280;
}

/* Panneau dépliable mobile (dropdown + export PDF) */
.territory-mobile-panel {
  display: none;
}

/* Transition slide-down */
.slide-down-enter-active {
  transition: all 0.25s ease-out;
}

.slide-down-leave-active {
  transition: all 0.2s ease-in;
}

.slide-down-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

@media (max-width: 767px) {
  .territory-banner {
    margin-bottom: 12px;
  }

  .territory-banner-content {
    padding: 10px 12px;
    flex-wrap: nowrap;
    gap: 10px;
  }

  /* Logo plus compact sur mobile */
  .territory-logo {
    padding: 2px 4px;
  }

  .territory-logo-img {
    height: 28px;
  }

  .territory-back-label {
    font-size: 9px;
  }

  /* Masquer l'icône département sur mobile pour gagner de la place */
  .territory-icon {
    display: none;
  }

  .territory-name {
    font-size: 16px;
    margin: 0 0 2px 0;
  }

  .territory-meta {
    font-size: 11px;
    gap: 4px;
  }

  /* Masquer les actions desktop sur mobile */
  .territory-actions-desktop {
    display: none !important;
  }

  /* Afficher le bouton overflow sur mobile */
  .territory-overflow-btn {
    display: flex;
  }

  /* Panneau mobile dépliable */
  .territory-mobile-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 16px;
    background: white;
    border-radius: 0 0 12px 12px;
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-top: 1px solid rgba(229, 231, 235, 0.4);
    margin-top: -1px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .territory-mobile-label {
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 4px;
    display: block;
    font-family: 'Inter', sans-serif;
  }

  .territory-mobile-select-wrapper .territory-communes-select-wrapper {
    min-width: 100%;
  }

  .territory-mobile-actions {
    display: flex;
    justify-content: flex-end;
  }
}

@media (min-width: 768px) {
  /* Sur tablette/desktop, masquer le panneau mobile */
  .territory-mobile-panel {
    display: none !important;
  }
}
</style>

