<template>
  <section class="communes-grid-section" aria-labelledby="communes-grid-title">
    <h2 id="communes-grid-title" class="sr-only">Liste des communes de {{ territoryName }}</h2>

    <div v-if="isLoading" class="grid-loading">
      <span class="grid-spinner" aria-hidden="true"></span>
      <p>Chargement des communes…</p>
    </div>

    <div v-else-if="communeStore.error" class="grid-error">
      <p>{{ communeStore.error }}</p>
    </div>

    <div v-else-if="formattedCommunes.length === 0" class="grid-empty">
      <p>Aucune commune disponible pour le moment.</p>
    </div>

    <ul v-else class="communes-grid" role="list">
      <li
        v-for="commune in formattedCommunes"
        :key="commune.code"
        class="commune-card-wrapper"
      >
        <router-link
          :to="`/commune/${commune.code}`"
          class="commune-card"
          :aria-label="`Voir la fiche de ${commune.name}`"
        >
          <span class="commune-card-name">{{ commune.name }}</span>
          <span class="commune-card-code">{{ commune.code }}</span>
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
/**
 * CommunesGrid - Grille de cartes cliquables pour la landing
 * Réutilise le store commune et la même logique que CommunesList
 */
import { computed } from 'vue'
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
.communes-grid-section {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.grid-loading,
.grid-error,
.grid-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary, #5a6c7d);
}

.grid-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light, #e2e8f0);
  border-top-color: var(--primary-blue, #1e2972);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.grid-error p {
  color: var(--error-color, #b91c1c);
}

.communes-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.commune-card-wrapper {
  margin: 0;
}

.commune-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary, #316d7b);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.commune-card:hover {
  border-color: var(--primary-blue, #1e2972);
  box-shadow: 0 2px 8px rgba(30, 41, 114, 0.12);
}

.commune-card-name {
  font-weight: 600;
  font-size: 1rem;
}

.commune-card-code {
  font-size: 0.875rem;
  color: var(--text-secondary, #5a6c7d);
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

@media (min-width: 640px) {
  .communes-grid {
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .commune-card {
    padding: 1.25rem;
  }
}
</style>
