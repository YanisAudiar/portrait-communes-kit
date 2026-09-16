<template>
  <nav class="breadcrumb-nav" aria-label="Fil d'Ariane">
    <ol class="breadcrumb-list">
      <!-- Accueil -->
      <li class="breadcrumb-item">
        <router-link to="/" class="breadcrumb-link">
          <svg class="breadcrumb-home-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Accueil</span>
        </router-link>
      </li>

      <!-- Commune -->
      <li class="breadcrumb-item">
        <span class="breadcrumb-separator" aria-hidden="true">›</span>
        <span class="breadcrumb-current" :class="{ 'breadcrumb-link-style': hasTheme }">
          {{ communeName }}
        </span>
      </li>

      <!-- Thème (si actif) -->
      <li v-if="themeName" class="breadcrumb-item">
        <span class="breadcrumb-separator" aria-hidden="true">›</span>
        <span class="breadcrumb-current" :class="{ 'breadcrumb-link-style': hasSubtheme }">
          {{ themeName }}
        </span>
      </li>

      <!-- Sous-thème (si actif) -->
      <li v-if="subthemeName" class="breadcrumb-item">
        <span class="breadcrumb-separator" aria-hidden="true">›</span>
        <span class="breadcrumb-current breadcrumb-active">
          {{ subthemeName }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  /** Nom de la commune */
  communeName: {
    type: String,
    default: 'Commune'
  },
  /** Nom du thème actif */
  themeName: {
    type: String,
    default: ''
  },
  /** Nom de la sous-thématique active */
  subthemeName: {
    type: String,
    default: ''
  }
})

const hasTheme = computed(() => Boolean(props.themeName))
const hasSubtheme = computed(() => Boolean(props.subthemeName))
</script>

<style scoped>
.breadcrumb-nav {
  padding: 12px 0 0 0;
  margin-bottom: 8px;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 2px;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #0A3D62;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}

.breadcrumb-link:hover {
  color: #316d7b;
  text-decoration: underline;
}

.breadcrumb-home-icon {
  flex-shrink: 0;
}

.breadcrumb-separator {
  color: #cbd5e1;
  font-size: 16px;
  font-weight: 300;
  margin: 0 4px;
  user-select: none;
}

.breadcrumb-current {
  color: #6b7280;
  font-weight: 400;
  background: none;
}

.breadcrumb-link-style {
  color: #475569;
  font-weight: 500;
  background: none;
}

.breadcrumb-active {
  color: #323F4B;
  font-weight: 600;
}

@media (max-width: 767px) {
  .breadcrumb-list {
    font-size: 12px;
  }

  .breadcrumb-separator {
    margin: 0 2px;
    font-size: 14px;
  }
}
</style>
