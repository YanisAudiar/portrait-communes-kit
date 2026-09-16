# Composants Dashboard

Ce dossier contient les composants modulaires extraits du fichier `Dashboard.vue` original pour améliorer la maintenabilité et la réutilisabilité.

---

## 📂 Structure

### Composants

| Composant | Description |
|-----------|-------------|
| `SidebarLeft.vue` | Bandeau gauche avec filtres et statistiques |
| `SidebarRight.vue` | Bandeau droit avec légende et informations |
| `InfoModal.vue` | Modal d'informations sur l'application |
| `SettingsModal.vue` | Modal de paramètres de la carte |
| `FloatingLegendButton.vue` | Bouton flottant pour afficher la légende (mobile) |
| `DashboardFooter.vue` | Pied de page du dashboard |
| `DashboardMapArea.vue` | Zone de carte principale |

### Fichiers utilitaires

- **`index.ts`** — Export centralisé des composants

---

## ✅ Avantages de cette modularisation

| Avant | Après |
|-------|-------|
| ❌ 1119 lignes de code | ✅ Dashboard.vue : ~200 lignes (-83%) |
| ❌ Mélange de responsabilités | ✅ Composants spécialisés |
| ❌ Styles CSS volumineux | ✅ Styles répartis par composant |
| ❌ Difficile à maintenir | ✅ Meilleure testabilité |
| ❌ Code dupliqué | ✅ Imports simplifiés via `index.ts` |

---

## 🔧 Utilisation

```vue
<template>
  <div>
    <SidebarLeft 
      v-model:departement="selectedDepartement"
      v-model:indicateur="selectedIndicateur"
      :communes-count="communesCount"
    />
    
    <SidebarRight 
      :selected-indicateur="selectedIndicateur"
      :is-collapsed="isLegendCollapsed"
      @toggle-collapse="toggleLegend"
    />
    
    <InfoModal :show="showInfo" @close="closeInfo" />
    <SettingsModal 
      :show="showSettings" 
      v-model:map-theme="mapTheme"
      @close="closeSettings" 
    />
  </div>
</template>

<script setup lang="ts">
import { 
  SidebarLeft, 
  SidebarRight, 
  InfoModal, 
  SettingsModal 
} from '@/components/Dashboard'
</script>
```

---

## 📋 Props et Events

### SidebarLeft

| Props | Type |
|-------|------|
| `departement` | `string` |
| `indicateur` | `string` |
| `communesCount` | `number` |
| `communesWithData` | `number` |
| `dataYear` | `string` |

| Events |
|--------|
| `update:departement` |
| `update:indicateur` |

### SidebarRight

| Props | Type |
|-------|------|
| `selectedIndicateur` | `string` |
| `isCollapsed` | `boolean` |

| Events |
|--------|
| `toggle-collapse` |

### Modals

| Props | Type |
|-------|------|
| `show` | `boolean` |
| `mapTheme` | `string` |
| `showPopulation` | `boolean` |

| Events |
|--------|
| `close` |
| `update:mapTheme` |
| `update:showPopulation` |
