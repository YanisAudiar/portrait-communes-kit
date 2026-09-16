# 🗺️ Composants Carte - Architecture Modulaire

## 📋 Vue d'ensemble

Cette architecture modulaire permet de créer et gérer des cartes interactives de manière simple, réutilisable et maintenable.

## 🏗️ Structure

```
frontend/src/
├── composables/                    # Logique métier réutilisable
│   ├── useMapInstance.js          # Gestion de l'instance MapLibre
│   ├── useMapColors.js            # Gestion des couleurs thématiques
│   └── useIndicatorFormat.js      # Formatage des indicateurs
│
└── components/
    └── Map/                        # Composants UI génériques
        ├── MapLegend.vue          # Légende de carte
        ├── MapOverlayInfo.vue     # Informations en overlay
        └── MapToolbar.vue         # Barre d'outils (boutons)
```

---

## 🔧 Composables

### 1. `useMapInstance` - Gestion de la carte

**Fonction** : Créer et gérer une instance MapLibre GL

#### Utilisation

```javascript
import { useMapInstance } from '@/composables/useMapInstance'

const { 
  map,              // Instance MapLibre (ref)
  loading,          // État de chargement (ref)
  error,            // Erreurs (ref)
  initMap,          // Initialiser la carte
  setGeoJSONSource, // Ajouter/mettre à jour une source
  addLayerIfNotExists, // Ajouter une couche
  updateLayerPaint, // Mettre à jour le style
  fitBounds,        // Zoomer sur des coordonnées
  zoomIn,           // Zoomer
  zoomOut,          // Dézoomer
  destroyMap        // Détruire la carte
} = useMapInstance()

// Initialiser
await initMap(containerElement, {
  center: [-1.68, 48.11],
  zoom: 10
})

// Ajouter une source GeoJSON
setGeoJSONSource('communes', geojsonData)

// Ajouter une couche
addLayerIfNotExists({
  id: 'communes-fill',
  type: 'fill',
  source: 'communes',
  paint: { 'fill-color': '#f17e08' }
})
```

#### API

| Méthode | Paramètres | Description |
|---------|-----------|-------------|
| `initMap` | `container, config` | Initialise la carte dans un élément DOM |
| `setGeoJSONSource` | `sourceId, geojson` | Crée ou met à jour une source GeoJSON |
| `addLayerIfNotExists` | `layerConfig` | Ajoute une couche si elle n'existe pas |
| `updateLayerPaint` | `layerId, property, value` | Met à jour une propriété de style |
| `fitBounds` | `coordinates, options` | Zoom sur des coordonnées |
| `zoomIn/Out` | - | Contrôles de zoom |

---

### 2. `useMapColors` - Gestion des couleurs

**Fonction** : Fournir des palettes de couleurs thématiques et générer des expressions MapLibre

#### Utilisation

```javascript
import { useMapColors } from '@/composables/useMapColors'

const selectedIndicator = computed(() => ({ theme: 'demographie' }))
const { 
  colorScale,          // Palette de 5 couleurs (computed)
  accentColor,         // Couleur principale (computed)
  getColorExpression,  // Expression MapLibre pour choroplèthe
  getLegendClasses     // Classes pour la légende
} = useMapColors(selectedIndicator)

// Générer une expression de couleur
const colorExpr = getColorExpression(
  [0, 500, 2000, 10000, 50000],  // Stops
  ['nb_menages', 'nb_men']        // Alias de champs
)

// Classes de légende
const legend = getLegendClasses(
  [0, 500, 2000, 10000, 50000],
  ['0-500', '500-2k', '2k-10k', '10k-50k', '>50k']
)
```

#### Thèmes disponibles

- `demographie` : Vert naturel
- `habitat` : Bleu professionnel
- `economie` : Orange terre
- `solidarite` : Rouge chaleureux
- `environnement` : Vert écologique
- `sante` : Violet santé
- `agriculture` : Jaune agricole

---

### 3. `useIndicatorFormat` - Formatage des indicateurs

**Fonction** : Extraire et formater les valeurs d'indicateurs depuis les données

#### Utilisation

```javascript
import { useIndicatorFormat } from '@/composables/useIndicatorFormat'

const { 
  getIndicatorConfig,   // Config complète (field, stops, labels)
  extractValue,         // Extraire la valeur brute
  formatValue,          // Formater pour affichage
  extractAndFormat      // Extraire + formater en une fois
} = useIndicatorFormat()

// Obtenir la configuration
const config = getIndicatorConfig(indicator)
// => { field: 'nb_menages', aliases: [...], stops: [...], labels: [...] }

// Extraire et formater
const displayValue = extractAndFormat(communeData, indicator)
// => "12 345" ou "45.2%" ou "2.5"
```

#### Indicateurs supportés

| Code | Champ | Format | Exemple |
|------|-------|--------|---------|
| `nbMenages` | `nb_menages` | Entier séparé | "12 345" |
| `tailleMoyenneMenage` | `taille_moyenne_menage` | Décimal 2 chiffres | "2.45" |
| `partPersonnesSeules` | `part_personnes_seules` | Pourcentage | "35.2%" |

**Ajout de nouveaux indicateurs** :

```javascript
// Dans useIndicatorFormat.js
const INDICATOR_CONFIGS = {
  // ... existants
  mon_indicateur: {
    field: 'mon_champ',
    aliases: ['mon_champ', 'mon_champ_alt'],
    stops: [0, 25, 50, 75, 100],
    labels: ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  }
}
```

---

## 🎨 Composants UI

### 1. `MapLegend` - Légende

**Props** :
- `visible` (Boolean) : Afficher/masquer
- `title` (String) : Titre de la légende
- `classes` (Array) : `[{ label, color }, ...]`

**Exemple** :

```vue
<MapLegend
  :visible="true"
  title="Nombre de ménages"
  :classes="[
    { label: '0 - 500', color: '#F2F5E6' },
    { label: '500 - 2k', color: '#DEE7C4' }
  ]"
/>
```

---

### 2. `MapOverlayInfo` - Informations overlay

**Props** :
- `icon` (String) : Emoji/icône
- `title` (String) : Titre principal
- `subtitle` (String) : Sous-titre (optionnel)
- `value` (String) : Valeur (optionnelle)

**Exemple** :

```vue
<MapOverlayInfo
  icon="📍"
  title="Rennes"
  subtitle="Nombre de ménages"
  value="12 345"
/>
```

---

### 3. `MapToolbar` - Barre d'outils

**Props** :
- `buttons` (Array) : Configuration des boutons
- `position` (String) : Position (`top-right`, `vertical-right`, etc.)
- `showLabels` (Boolean) : Afficher les labels

**Exemple** :

```vue
<MapToolbar
  position="top-right"
  :show-labels="true"
  :buttons="[
    {
      id: 'zoom-in',
      icon: '<svg>...</svg>',
      label: 'Zoomer',
      tooltip: 'Zoomer sur la carte',
      active: false,
      onClick: zoomIn
    }
  ]"
/>
```

---

## 📝 Exemple complet : Créer une carte choroplèthe

```vue
<template>
  <div class="map-wrapper">
    <div ref="container" class="map-container"></div>
    
    <MapOverlayInfo
      icon="📍"
      :title="commune.nom"
      :subtitle="indicator.label"
      :value="indicatorValue"
    />
    
    <MapToolbar
      position="vertical-right"
      :buttons="controlButtons"
    />
    
    <MapLegend
      :title="indicator.label"
      :classes="legendClasses"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMapInstance } from '@/composables/useMapInstance'
import { useMapColors } from '@/composables/useMapColors'
import { useIndicatorFormat } from '@/composables/useIndicatorFormat'
import MapLegend from '@/components/Map/MapLegend.vue'
import MapOverlayInfo from '@/components/Map/MapOverlayInfo.vue'
import MapToolbar from '@/components/Map/MapToolbar.vue'

const props = defineProps({
  commune: Object,
  indicator: Object
})

// Composables
const { map, initMap, setGeoJSONSource, addLayerIfNotExists, zoomIn, zoomOut } = useMapInstance()
const { getColorExpression, getLegendClasses } = useMapColors(computed(() => props.indicator))
const { getIndicatorConfig, extractAndFormat } = useIndicatorFormat()

// État
const container = ref(null)

// Valeur de l'indicateur
const indicatorValue = computed(() => 
  extractAndFormat(props.commune, props.indicator)
)

// Classes de légende
const legendClasses = computed(() => {
  const config = getIndicatorConfig(props.indicator)
  return getLegendClasses(config.stops, config.labels)
})

// Boutons de contrôle
const controlButtons = computed(() => [
  { id: 'zoom-in', icon: '➕', onClick: zoomIn },
  { id: 'zoom-out', icon: '➖', onClick: zoomOut }
])

// Charger les données
const loadData = async () => {
  // Récupérer les données
  const geojson = await fetchGeoJSON()
  
  // Ajouter la source
  setGeoJSONSource('data', geojson)
  
  // Obtenir la configuration de couleur
  const config = getIndicatorConfig(props.indicator)
  const colorExpr = getColorExpression(config.stops, config.aliases)
  
  // Ajouter la couche
  addLayerIfNotExists({
    id: 'choropleth',
    type: 'fill',
    source: 'data',
    paint: {
      'fill-color': colorExpr,
      'fill-opacity': 0.7
    }
  })
}

onMounted(async () => {
  await initMap(container.value)
  await loadData()
})
</script>
```

---

## 🚀 Avantages de cette architecture

### ✅ **Réutilisabilité**
- Composables utilisables dans plusieurs composants
- Composants UI génériques pour toutes les cartes

### ✅ **Maintenabilité**
- Logique séparée de la présentation
- Code plus court et lisible
- Facile à tester unitairement

### ✅ **Extensibilité**
- Ajouter de nouveaux indicateurs facilement
- Personnaliser les couleurs par thème
- Créer de nouveaux types de cartes

### ✅ **Performance**
- Computed properties pour optimiser les calculs
- Composants légers et découplés

---

## 🔄 Migration depuis l'ancien code

### Avant (1394 lignes) ❌
```javascript
// Tout dans un seul fichier
// Logique + UI + styles mélangés
// Code dupliqué
// Difficile à tester
```

### Après (546 lignes) ✅
```javascript
// Logique dans composables
// UI dans composants réutilisables
// Configuration centralisée
// Facile à tester et maintenir
```

---

## 📚 Ressources

- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/api/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [GeoJSON Specification](https://geojson.org/)

