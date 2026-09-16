# Debug - Problème d'affichage des graphiques

## 🔍 Problème identifié

Les graphiques affichent "0%" et "Sans label" au lieu des données réelles.

## ✅ Corrections apportées

### 1. Passage des props `labelField` et `valueField` depuis `chartItem`

**Fichier** : `frontend/src/views/CommuneDetail.vue`

**Avant** :
```vue
<ChartComponent
  label-field="label"
  value-field="value"
  ...
/>
```

**Après** :
```vue
<ChartComponent
  :label-field="chartItem.labelField || 'label'"
  :value-field="chartItem.valueField || 'value'"
  :chart-options="chartItem.chartOptions"
  ...
/>
```

### 2. Ajout de logs de debug

**Fichiers** :
- `frontend/src/composables/useThemeCharts.js`
- `frontend/src/services/chart/chartDataFormatter.js`

Les logs affichent maintenant :
- La structure des données reçues
- Les champs disponibles dans les données
- Les champs `labelField` et `valueField` utilisés

## 🔍 Vérifications à faire

1. **Ouvrir la console du navigateur** et vérifier les logs :
   - `📊 [indicator-id]: Structure des données`
   - `⚠️ extractLabels/extractValues: champ introuvable`

2. **Vérifier que les données contiennent bien les champs attendus** :
   - Pour `demo-evol-pop` : `annee` (label) et `pop` (value)
   - Pour `demo-taux-evol` : `annee` (label) et `tx_evol` (value)

3. **Vérifier la structure des données de l'API** :
   - Les données doivent être un tableau d'objets
   - Chaque objet doit contenir les champs `labelField` et `valueField`

## 📝 Structure attendue des données

Pour un graphique avec `labelField: 'annee'` et `valueField: 'pop'` :

```javascript
[
  { annee: 2020, pop: 1234, ... },
  { annee: 2021, pop: 1256, ... },
  { annee: 2022, pop: 1280, ... }
]
```

## 🐛 Si le problème persiste

1. Vérifier dans la console les logs de debug
2. Vérifier que les données de l'API sont bien structurées
3. Vérifier que les champs `labelField` et `valueField` correspondent aux champs réels dans les données

