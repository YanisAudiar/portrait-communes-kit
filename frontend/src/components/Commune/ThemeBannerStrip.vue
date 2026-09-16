<template>
  <div class="themes-strip" :class="{ 'themes-strip--compact': unifiedActiveStyle }">
    <button
      v-for="theme in themeOptions"
      :key="theme.id"
      type="button"
      class="theme-item"
      :class="{ active: activeThemeId === theme.id }"
      :style="{ '--theme-accent': theme.color }"
      :title="theme.label"
      @click="$emit('theme-selected', theme.id)"
    >
      <!-- Zone icône seule (carré) : teal si actif -->
      <span class="theme-item-icon">
        <img
          :src="activeThemeId === theme.id ? theme.icon : (theme.iconInactive ?? theme.icon)"
          :alt="theme.label"
          loading="lazy"
        />
      </span>
      <!-- Label en petites majuscules sous la carte, à l'extérieur -->
      <span class="theme-item-label theme-label-full">{{ theme.label }}</span>
      <span class="theme-item-label theme-label-short">{{ getShortLabel(theme.label) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    themeOptions: { id: string; label: string; icon: string; iconInactive?: string; color: string }[]
    activeThemeId: string
    /** Style maquette : actif = bleu-vert plein, inactifs = blanc + bordure grise */
    unifiedActiveStyle?: boolean
  }>(),
  { unifiedActiveStyle: false }
)
const unifiedActiveStyle = props.unifiedActiveStyle

defineEmits<{ (e: 'theme-selected', themeId: string): void }>()

/** Abréviations des labels longs pour mobile */
const SHORT_LABELS: Record<string, string> = {
  'Enseignement': 'Enseign.',
  'Economie-emploi': 'Éco-emploi',
  'Energie-Environnement': 'Énergie-Env.',
  'Equipement et services': 'Équip.',
  'Solidarité': 'Solidarité',
  'Démographie': 'Démo.',
  'Mobilités': 'Mobilités',
  'Agriculture': 'Agri.',
  'Habitat': 'Habitat'
}

function getShortLabel(label: string): string {
  return SHORT_LABELS[label] || label
}
</script>

<style scoped>
.themes-strip {
  display: flex;
  align-items: stretch;
  gap: 6px;
  padding: 6px;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  box-shadow: none;
  border-radius: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.themes-strip::-webkit-scrollbar {
  display: none;
}

.theme-item {
  --theme-accent: #f17e08;
  flex: 1;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.theme-item:hover {
  border-color: #cbd5e1;
  color: #475569;
}

.theme-item.active {
  border-color: #e5e7eb;
  color: var(--bleu-eucalyptus, #316d7b);
}

/* Style compact : présence visuelle augmentée, seule la zone icône en teal si actif */
.themes-strip--compact .theme-item {
  min-width: 80px;
  padding: 10px 8px;
  gap: 6px;
  background: #fff;
  border: none;
  border-radius: 6px;
}

/* Carte active : tout le fond en teal */
.themes-strip--compact .theme-item.active {
  background: var(--bleu-eucalyptus, #316d7b);
  border: none;
}

/* Zone icône : teal uniquement pour l'actif */
.theme-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  transition: background 0.2s ease;
}

.themes-strip--compact .theme-item-icon {
  width: 52px;
  height: 52px;
  border-radius: 8px;
}

/* Zone icône active : fond transparent (plus de carré teal séparé) */
.themes-strip--compact .theme-item.active .theme-item-icon {
  background: transparent;
}

.themes-strip--compact .theme-item:not(.active) .theme-item-icon {
  background: transparent;
}

.themes-strip--compact .theme-item:hover .theme-item-icon {
  background: #f1f5f9;
}

/* Hover sur actif : légèrement plus foncé */
.themes-strip--compact .theme-item.active:hover .theme-item-icon {
  background: transparent;
}

/* Icônes style outline (fines) */
.theme-item-icon img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.themes-strip--compact .theme-item-icon img {
  width: 34px;
  height: 34px;
}

.themes-strip--compact .theme-item:not(.active) .theme-item-icon img {
  filter: brightness(0) saturate(100%) opacity(0.65);
}

/* Icône active en blanc */
.themes-strip--compact .theme-item.active .theme-item-icon img {
  filter: brightness(0) invert(1);
}

/* Label en petites majuscules sous la carte, taille réduite */
.theme-item-label {
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 1.2;
}

.themes-strip--compact .theme-item-label {
  font-size: 9px;
}

/* Label actif en blanc */
.themes-strip--compact .theme-item.active .theme-item-label {
  color: #fff;
}

.theme-label-full {
  display: block;
}

.theme-label-short {
  display: none;
}

/* Par défaut (desktop) : label complet visible, label court masqué */
.theme-label-full {
  display: block;
}

.theme-label-short {
  display: none;
}

@media (max-width: 1024px) {
  .themes-strip--compact .theme-item {
    min-width: 86px;
    padding: 12px 10px;
    gap: 8px;
  }

  .themes-strip--compact .theme-item-icon {
    width: 48px;
    height: 48px;
  }

  .themes-strip--compact .theme-item-icon img {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 767px) {
  .themes-strip {
    gap: 4px;
    padding: 4px;
    border-radius: 0;
    border-left: none;
    border-right: none;
    margin: 0 -16px;
    padding-left: 16px;
    padding-right: 16px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .themes-strip::after {
    content: '';
    flex-shrink: 0;
    width: 16px;
    height: 1px;
  }

  .themes-strip--compact .theme-item {
    min-width: 80px;
    max-width: 96px;
    padding: 14px 12px;
    gap: 10px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }

  .themes-strip--compact .theme-item-icon {
    width: 48px;
    height: 48px;
  }

  .themes-strip--compact .theme-item-icon img {
    width: 30px;
    height: 30px;
  }

  .theme-label-full {
    display: none;
  }

  .theme-label-short {
    display: block;
    font-size: 10px;
  }

  .theme-item:active {
    transform: scale(0.97);
    transition: transform 0.1s ease;
  }
}

@media (max-width: 399px) {
  .themes-strip--compact .theme-item {
    min-width: 72px;
    max-width: 84px;
    padding: 12px 10px;
    gap: 8px;
  }

  .themes-strip--compact .theme-item-icon {
    width: 44px;
    height: 44px;
  }

  .themes-strip--compact .theme-item-icon img {
    width: 26px;
    height: 26px;
  }

  .theme-label-short {
    display: none;
  }
}

@media (max-width: 479px) and (min-width: 400px) {
  .themes-strip {
    gap: 4px;
    padding: 4px;
    margin: 0 -12px;
    padding-left: 12px;
    padding-right: 12px;
  }

  .themes-strip--compact .theme-item-label {
    font-size: 8px;
  }
}

@media (max-width: 767px) and (orientation: landscape) {
  .themes-strip {
    padding: 4px;
    gap: 4px;
  }

  .themes-strip--compact .theme-item {
    min-width: 74px;
    padding: 12px 10px;
    flex-direction: column;
    gap: 8px;
  }

  .themes-strip--compact .theme-item-icon {
    width: 42px;
    height: 42px;
  }

  .themes-strip--compact .theme-item-icon img {
    width: 24px;
    height: 24px;
  }
}
</style>
