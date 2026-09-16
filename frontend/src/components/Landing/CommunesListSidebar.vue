<template>
  <aside class="communes-list-sidebar" aria-label="Choisir un territoire d'observation">
    <!-- Titre de section -->
    <h3 class="choose-title">Choisir un territoire d'observation :</h3>

    <!-- Sélecteur de commune + bouton Explorer -->
    <div v-if="isLoading" class="sidebar-loading">
      <span class="sidebar-spinner" aria-hidden="true"></span>
      <span>Chargement des communes…</span>
    </div>

    <div v-else-if="communeStore.error" class="sidebar-error">
      <p>{{ communeStore.error }}</p>
    </div>

    <div v-else-if="formattedCommunes.length === 0" class="sidebar-empty">
      <p>Aucune commune disponible pour le moment.</p>
    </div>

    <div v-else class="sidebar-select-row">
      <label for="landing-communes-select" class="sr-only">Sélectionner une commune</label>
      <div class="select-wrapper">
        <select
          id="landing-communes-select"
          v-model="selectedCode"
          class="communes-select"
          aria-label="Sélectionner une commune"
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
        <span class="select-arrow" aria-hidden="true">▾</span>
      </div>
      <router-link
        v-if="selectedCode"
        :to="`/commune/${selectedCode}`"
        class="btn-explorer"
      >
        Explorer
      </router-link>
      <span v-else class="btn-explorer btn-explorer--disabled" aria-disabled="true">
        Explorer
      </span>
    </div>

    <!-- Texte descriptif avec liste des indicateurs -->
    <div class="sidebar-description">
      <p>
        Pour chacune des communes de {{ territoryName }},
        ce site propose la consultation des principaux indicateurs en matière de :
      </p>
      <ul class="indicators-list">
        <li>démographie,</li>
        <li>habitat,</li>
        <li>enseignement,</li>
        <li>économie / emploi,</li>
        <li>solidarité,</li>
        <li>énergie / environnement,</li>
        <li>mobilités,</li>
        <li>agriculture,</li>
        <li>équipements / services.</li>
      </ul>
      <p>
        Cette première sélection a vocation à évoluer dans le temps en fonction
        des besoins et des disponibilités des données.
      </p>
      <p>
        Cet outil offre la possibilité d'effectuer des comparaisons de territoire,
        de récupérer des graphiques ou des données liées.
      </p>
      <p class="sidebar-salutation">Bonne navigation !</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
/**
 * CommunesListSidebar - Liste déroulante + bouton Explorer pour la page d'accueil
 * Carte à gauche (petite partie), panneau droit avec select (pas liste entière)
 */
import { computed, ref } from 'vue'
import { useCommuneStore } from '@/stores'
import { getFeatureCode, getFeatureName } from '@/utils/mapHelpers'
import { siteConfig } from '@/config/site'

interface Commune {
  code: string
  name: string
  hasData: boolean
}

const communeStore = useCommuneStore()
const territoryName = siteConfig.territory.name

const isLoading = computed<boolean>(() => Boolean(communeStore.loading))

const selectedCode = ref<string>('')

const formattedCommunes = computed<Commune[]>(() => {
  const list = Array.isArray(communeStore.communes) ? communeStore.communes : []
  return list
    .map((feature: { properties?: { code?: string; nom?: string; code_insee_concat?: string; has_data?: boolean } }) => {
      const code = getFeatureCode(feature)
      const name = getFeatureName(feature)
      return {
        code,
        name,
        hasData: Boolean((feature as any)?.properties?.has_data)
      }
    })
    .filter((c: Commune) => Boolean(c.code) && Boolean(c.name))
    .sort((a: Commune, b: Commune) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
})

</script>

<style scoped>
/* Panneau droit de la page d'accueil */
.communes-list-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: transparent;
  overflow-y: auto;
  padding: 2rem 2.5rem;
}

/* Titre "CHOISIR UN TERRITOIRE D'OBSERVATION" */
.choose-title {
  font-size: 0.9375rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-primary, #316d7b);
  margin: 0 0 1.25rem;
}

/* États : chargement, erreur, vide */
.sidebar-loading,
.sidebar-error,
.sidebar-empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0;
  font-size: 0.9375rem;
  color: var(--text-secondary, #5a6c7d);
}

.sidebar-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-light, #e2e8f0);
  border-top-color: var(--primary-blue, #1e2972);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sidebar-error p {
  margin: 0;
  color: var(--error-color, #b91c1c);
}

/* Select + bouton Explorer sur la même ligne, largeur limitée */
.sidebar-select-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  max-width: 420px;
}

.select-wrapper {
  position: relative;
  flex: 1;
}

.communes-select {
  width: 100%;
  height: 100%;
  padding: 0.5rem 2.25rem 0.5rem 1rem;
  font-size: 0.9375rem;
  font-family: var(--font-body, 'Montserrat', sans-serif);
  color: var(--text-secondary, #5a6c7d);
  background: #fff;
  border: 1px solid #b0c4c9;
  border-radius: 50px;
  appearance: none;
  cursor: pointer;
}

.communes-select:focus {
  outline: none;
  border-color: var(--bleu-eucalyptus, #316D7B);
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--bleu-eucalyptus, #316D7B);
  font-size: 1rem;
}

/* Bouton Explorer : couleur #628a94, coins arrondis pilule */
.btn-explorer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-body, 'Montserrat', sans-serif);
  color: #fff;
  background: #628a94;
  border: none;
  border-radius: 50px;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-explorer:hover:not(.btn-explorer--disabled) {
  background: #4f7a84;
}

.btn-explorer--disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

/* Texte descriptif et liste des indicateurs - police agrandie */
.sidebar-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary, #5a6c7d);
}

.sidebar-description p {
  margin: 0 0 0.5rem;
}

.indicators-list {
  margin: 0.25rem 0 0.75rem 0;
  padding-left: 1rem;
  list-style: "- ";
}

.indicators-list li {
  margin: 0.1rem 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-secondary, #5a6c7d);
}

.sidebar-salutation {
  margin-top: 0.5rem;
  font-weight: 500;
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

/* Responsive mobile */
@media (max-width: 767px) {
  .communes-list-sidebar {
    padding: 1.25rem 1rem;
  }

  .sidebar-select-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
