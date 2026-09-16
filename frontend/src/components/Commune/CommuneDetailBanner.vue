<template>
  <div class="commune-detail-banner site-header">
      <!-- Bandeau bleu clair : titre + sélecteur commune + Explorer + logo agence -->
    <header class="detail-banner-top">
      <div class="detail-banner-top-inner">
        <div class="detail-banner-title-group">
          <router-link to="/" class="detail-banner-home-link" aria-label="Accueil">
            <svg class="detail-banner-home-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </router-link>
          <h1 class="detail-banner-title">
            <strong>{{ territory.productTitle }}</strong><span class="detail-banner-title-suffix"> de {{ territory.name }}</span>
          </h1>
        </div>
        <div class="detail-banner-controls">
          <div class="detail-banner-select-wrapper">
            <label for="detail-communes-select" class="sr-only">Sélectionner une commune</label>
            <select
              id="detail-communes-select"
              v-model="selectedCode"
              class="detail-banner-select commune-select"
              :class="{ 'has-value': !!selectedCode }"
              aria-label="Sélectionner une commune"
              :disabled="isLoading || formattedCommunes.length === 0"
              @change="handleCommuneChange"
            >
              <option value="" disabled>Sélectionner une commune</option>
              <option
                v-for="commune in formattedCommunes"
                :key="commune.code"
                :value="commune.code"
              >
                {{ commune.name }}
              </option>
            </select>
            <span class="detail-banner-select-arrow" aria-hidden="true">▾</span>
          </div>
          <button
            type="button"
            class="detail-banner-explorer btn-explorer"
            :disabled="!selectedCode || isLoading"
            @click="handleExplorerClick"
          >
            Explorer
          </button>
        </div>
        <a
          :href="agency.website"
          target="_blank"
          rel="noopener noreferrer"
          class="detail-banner-logo"
          :aria-label="`${agency.name} - Site officiel`"
        >
          <img
            v-if="!logoError"
            src="@/assets/images/logo-Audiar.svg"
            :alt="agency.name"
            class="detail-banner-logo-img"
            @error="logoError = true"
          />
          <span v-else class="detail-banner-logo-fallback">{{ agency.shortName }}</span>
        </a>
      </div>
    </header>

    <!-- Ligne blanche : nom commune (toujours visible) -->
    <div class="detail-banner-bottom">
      <h2 class="detail-banner-commune-name">{{ communeData?.nom || 'Commune' }}</h2>
      <div v-if="$slots.actions" class="detail-banner-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Bandeau de la page détail commune : bandeau bleu (titre + sélecteur + Explorer + logo)
 * puis ligne blanche (nom commune + slot actions pour Export PDF).
 * Remplace l’ancien TerritoryBanner pour correspondre à la maquette.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCommuneStore } from '@/stores'
import { getFeatureCode, getFeatureName } from '@/utils/mapHelpers'
import { siteConfig } from '@/config/site'

const agency = siteConfig.agency
const territory = siteConfig.territory

/** Type pour une commune dans la liste du sélecteur */
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

watch(
  () => props.codeInsee,
  (code) => {
    selectedCode.value = code
  }
)

const isLoading = computed(() => Boolean(communeStore.loading))

const formattedCommunes = computed(() => {
  const list = Array.isArray(communeStore.communes) ? communeStore.communes : []
  return list
    .map((feature) => ({
      code: getFeatureCode(feature),
      name: getFeatureName(feature)
    }))
    .filter((c) => Boolean(c.code) && Boolean(c.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
})

function handleCommuneChange() {
  if (!selectedCode.value) return
  router.push(`/commune/${selectedCode.value}`)
}

function handleExplorerClick() {
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
</script>

<style scoped>
.commune-detail-banner {
  margin-bottom: 24px;
}

.site-header {
  border-bottom: none;
}

/* Bandeau bleu clair (style landing) */
.detail-banner-top {
  background: #ebf5f6;
  padding: 1.25rem 2rem 1rem;
}

.detail-banner-top-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  min-height: 52px;
}

.detail-banner-title-group {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.detail-banner-home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: var(--bleu-eucalyptus, #316d7b);
  border: 1px solid rgba(49, 109, 123, 0.18);
  background: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.detail-banner-home-link:hover {
  background: #ffffff;
  border-color: rgba(49, 109, 123, 0.35);
}

.detail-banner-title {
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 1.75rem;
  font-weight: 300;
  color: var(--bleu-eucalyptus, #316d7b);
  margin: 0;
  line-height: 1.2;
}

.detail-banner-title strong {
  font-weight: 700;
  color: var(--bleu-eucalyptus, #316d7b);
}

/* Suffixe du titre (territoire) en gris plus clair (maquette) */
.detail-banner-title-suffix {
  font-weight: 400;
  color: #667085;
}

/* Sélecteur + bouton Explorer : même style que la page d'accueil (CommunesListSidebar) */
.detail-banner-controls {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  flex-shrink: 0;
  max-width: 420px;
}

.detail-banner-select-wrapper {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.detail-banner-select,
.commune-select {
  width: 100%;
  height: 100%;
  min-height: 42px;
  padding: 8px 2.25rem 8px 16px;
  font-size: 0.9375rem;
  font-family: var(--font-body, 'Montserrat', sans-serif);
  color: #94a3b8;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  appearance: none;
  cursor: pointer;
}

/* Quand une commune est sélectionnée : texte foncé (maquette) */
.detail-banner-select.has-value {
  color: #334155;
}

.detail-banner-select:focus {
  outline: none;
  border-color: var(--bleu-eucalyptus, #316d7b);
}

.detail-banner-select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.detail-banner-select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--bleu-eucalyptus, #316d7b);
  font-size: 1rem;
}

/* Bouton Explorer : bleu sarcelle foncé comme le titre (maquette) */
.detail-banner-explorer,
.btn-explorer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 24px;
  min-height: 42px;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-body, 'Montserrat', sans-serif);
  color: #fff;
  background: var(--bleu-eucalyptus, #316d7b);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.detail-banner-explorer:hover:not(:disabled) {
  background: #2a5c68;
}

.detail-banner-explorer:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.detail-banner-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.detail-banner-logo-img {
  height: 48px;
  width: auto;
}

.detail-banner-logo-fallback {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--bleu-eucalyptus, #316d7b);
}

/* Nom commune + Export PDF */
.detail-banner-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 2rem;
  background: transparent;
}

.detail-banner-commune-name {
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--bleu-eucalyptus, #316d7b);
  margin: 0;
  letter-spacing: -0.01em;
}

.detail-banner-actions {
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

/* Responsive : réduire la place du bandeau pour arriver plus vite aux chiffres clés */
@media (max-width: 767px) {
  .commune-detail-banner {
    margin-bottom: 12px;
  }

  .detail-banner-top {
    padding: 0.5rem 0.75rem 0.4rem;
  }

  .detail-banner-top-inner {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    min-height: 0;
  }

  .detail-banner-title-group {
    justify-content: center;
    gap: 0.5rem;
  }

  .detail-banner-home-link {
    width: 34px;
    height: 34px;
    align-self: center;
  }

  .detail-banner-title {
    font-size: 1rem;
    text-align: center;
    line-height: 1.15;
  }

  .detail-banner-controls {
    flex-direction: column;
    gap: 0.4rem;
    max-width: none;
    justify-content: center;
  }

  .detail-banner-select {
    min-height: 36px;
    padding: 0.4rem 2rem 0.4rem 0.75rem;
    font-size: 0.875rem;
  }

  .detail-banner-explorer {
    min-height: 36px;
    padding: 0.4rem 1rem;
    font-size: 0.875rem;
  }

  .detail-banner-select-wrapper {
    min-width: 0;
    flex: 1;
    width: 100%;
  }

  .detail-banner-logo {
    justify-content: center;
  }

  .detail-banner-logo-img {
    height: 28px;
  }

  .detail-banner-bottom {
    padding: 0.5rem 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .detail-banner-commune-name {
    font-size: 1.15rem;
    width: 100%;
    text-align: center;
  }

  .detail-banner-actions {
    width: 100%;
    justify-content: center;
  }
}

/* Très petit écran : bandeau encore plus compact */
@media (max-width: 479px) {
  .commune-detail-banner {
    margin-bottom: 8px;
  }

  .detail-banner-top {
    padding: 0.4rem 0.5rem 0.35rem;
  }

  .detail-banner-top-inner {
    gap: 0.4rem;
  }

  .detail-banner-title {
    font-size: 0.9rem;
  }

  .detail-banner-bottom {
    padding: 0.4rem 0.5rem;
  }

  .detail-banner-commune-name {
    font-size: 1.05rem;
  }

  .detail-banner-logo-img {
    height: 24px;
  }
}
</style>
