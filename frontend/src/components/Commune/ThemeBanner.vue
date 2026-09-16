<template>
  <section class="theme-selector">
    <ThemeBannerStrip
      :theme-options="themeOptions"
      :active-theme-id="activeThemeId"
      :unified-active-style="unifiedActiveStyle"
      @theme-selected="selectTheme"
    />
    <!-- Description supprimée : elle était redondante avec le titre de section -->
  </section>
</template>

<script setup lang="ts">
/**
 * ThemeBanner - Bannière de sélection de thème (Démographie, Économie, etc.)
 * Délègue l'affichage des boutons à ThemeBannerStrip
 */
import { computed } from 'vue'
import { themes, isThemeWithoutData } from '@/config/indicatorsConfig'
import ThemeBannerStrip from './ThemeBannerStrip.vue'

const props = defineProps({
  activeThemeId: {
    type: String,
    default: 'demographie'
  },
  scrollProgress: {
    type: Number,
    default: 0
  },
  /** Style maquette : actif = bleu-vert plein, inactifs = blanc + bordure grise */
  unifiedActiveStyle: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (e: 'theme-selected', themeId: string): void
}>()

/** Thématiques sans données : pas de bouton (Énergie-Env., Mobilités, Équipements). */
const themeOptions = computed(() =>
  Object.entries(themes)
    .filter(([id]) => !isThemeWithoutData(id))
    .map(([id, theme]) => ({
      id,
      label: theme.label,
      icon: theme.icon,
      iconInactive: theme.iconInactive ?? theme.icon,
      color: theme.color
    }))
)

const currentThemeDescription = computed(() => themes[props.activeThemeId]?.description ?? '')

function selectTheme(themeId: string) {
  emit('theme-selected', themeId)
}
</script>

<style scoped>
@import '@/assets/css/modern-dashboard.css';

.theme-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-selector-description {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #7b8794;
  line-height: 1.5;
  padding: 0 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 767px) {
  .theme-selector {
    margin: 0 -16px 16px;
    padding: 0 16px;
  }

  .theme-selector-description {
    display: none;
  }
}

@media (max-width: 479px) {
  .theme-selector {
    margin: 0 -12px 12px;
    padding: 0 12px;
  }
}

@media (max-width: 767px) and (orientation: landscape) {
  .theme-selector {
    margin-bottom: 10px;
  }
}
</style>
