# Configurations Chart.js Prédéfinies

## 📋 Vue d'ensemble

Le système de configurations prédéfinies Chart.js permet d'utiliser les mêmes configurations que l'ancienne application (`chart_options.js`), adaptées pour Chart.js v4.

## 🎯 Objectif

- **Uniformiser** les graphiques avec l'ancienne application
- **Simplifier** la configuration des indicateurs
- **Réutiliser** les configurations éprouvées

## 📦 Configurations Disponibles

### 1. `chartClassicBar`
Graphique en barres classique **avec légende**

**Utilisation** : Graphiques en barres standards nécessitant une légende

### 2. `chartClassicBarNoLegend`
Graphique en barres classique **SANS légende**

**Utilisation** : 
- Évolution du nombre d'habitants
- Évolution du nombre de résidences principales
- Évolution de l'indice de jeunesse
- Évolution de la taille moyenne des ménages
- Évolution du nombre d'emplois total
- Revenus disponibles par UC

### 3. `chartClassicBarPercent`
Graphique en barres avec valeurs en pourcentage **avec légende**

**Utilisation** : Graphiques en barres avec pourcentages nécessitant une légende

### 4. `chartClassicBarPercentNoLegend`
Graphique en barres avec valeurs en pourcentage **SANS légende**

**Utilisation** :
- Taux d'évolution annuel moyen
- Origine des revenus disponibles par UC

### 5. `chartLine`
Graphique linéaire avec légende

**Utilisation** :
- Évolution du nombre de naissances et de décès domiciliés
- Évolution du nombre d'élèves du premier degré
- Évolution du nombre d'élèves du second degré

### 6. `chartStackedSum`
Graphique en barres empilées avec affichage de la somme dans le tooltip

**Utilisation** :
- Évolution démographique annuelle moyenne (soldes)
- Évolution du nombre de logements d'occasion vendus par type

### 7. `chartPyramide`
Graphique en barres horizontales empilées pour pyramide des âges

**Utilisation** :
- Pyramide des âges

### 8. `chartHorizontal`
Graphique en barres horizontales

**Utilisation** : Graphiques horizontaux standards

### 9. `chartClassicDoughnut`
Graphique en donut classique avec pourcentages dans le tooltip

**Utilisation** :
- Répartition du nombre de ménages par types
- Répartition du nombre de logements selon le statut d'occupation
- Répartition du nombre de créations d'établissements par type d'activité
- Répartition des emplois par catégorie socioprofessionnelle
- Répartition des emplois par secteur d'activité
- Répartition des actifs en emploi par lieu de travail

## 🔧 Utilisation dans les Indicateurs

### Méthode 1 : Utiliser une configuration prédéfinie

```javascript
{
  id: 'demo-evol-pop',
  label: 'Évolution du nombre d\'habitants',
  chartType: 'bar',
  chartPreset: 'chartClassicBarNoLegend', // ← Configuration prédéfinie
  apiField: 'pop',
  groupBy: 'annee',
  dataSource: 'evolution_population',
  available: true
}
```

### Méthode 2 : Combiner configuration prédéfinie et options personnalisées

```javascript
{
  id: 'demo-solde-naturel-migratoire',
  label: 'Évolution démographique annuelle moyenne',
  chartType: 'bar',
  chartPreset: 'chartStackedSum', // ← Configuration prédéfinie
  options: { indexAxis: 'y' }, // ← Options personnalisées supplémentaires
  datasets: [
    { code: 'solde_naturel', label: 'Solde naturel' },
    { code: 'solde_migratoire_apparent', label: 'Solde migratoire apparent' }
  ],
  dataSource: 'solde_naturel_migratoire',
  available: true
}
```

### Méthode 3 : Utiliser uniquement des options personnalisées (sans preset)

```javascript
{
  id: 'custom-chart',
  label: 'Graphique personnalisé',
  chartType: 'bar',
  options: {
    // Options Chart.js personnalisées
    scales: {
      y: { beginAtZero: true }
    }
  },
  dataSource: 'custom_data',
  available: true
}
```

## 📊 Correspondance avec l'Ancienne Application

| Ancienne App | Nouvelle App | Indicateurs |
|--------------|--------------|-------------|
| `chartClassicBarNoLegend` | `chartClassicBarNoLegend` | Évolution population, résidences principales, indice jeunesse, taille ménages, emplois total, revenus disponibles |
| `chartClassicBarPercentNoLegend` | `chartClassicBarPercentNoLegend` | Taux évolution, origine revenus |
| `chartLine` | `chartLine` | Naissances/décès, élèves premier/second degré |
| `chartStackedSum` | `chartStackedSum` | Soldes démographiques, ventes logements occasion |
| `chartPyramide` | `chartPyramide` | Pyramide des âges |
| `chartClassicDoughnut` | `chartClassicDoughnut` | Tous les graphiques en donut |

## 🎨 Caractéristiques des Configurations

### Formatage des Valeurs
- **Nombres** : Formatage avec séparateurs de milliers (`toLocaleString('fr-FR')`)
- **Pourcentages** : Formatage avec le symbole `%`
- **Tooltips** : Affichage formaté avec label et valeur

### Options Communes
- `responsive: true` : Graphiques adaptatifs
- `maintainAspectRatio: false` : Hauteur fixe
- `animation: { duration: 0 }` : Pas d'animation (comme l'ancienne app)
- Grilles désactivées (`grid: { display: false }`)
- Bordures désactivées (`border: { display: false }`)

## 📝 Fichiers Concernés

- **Configurations** : `frontend/src/services/chart/chartPresets.js`
- **Intégration** : `frontend/src/composables/useThemeCharts.js`
- **Indicateurs** : `frontend/src/config/indicators/*.js`

## ✅ Avantages

1. **Cohérence** : Même apparence que l'ancienne application
2. **Simplicité** : Une seule propriété `chartPreset` au lieu de nombreuses options
3. **Maintenabilité** : Modifications centralisées dans un seul fichier
4. **Réutilisabilité** : Configurations partagées entre tous les indicateurs

## 🔄 Migration depuis l'Ancienne Application

Pour migrer un graphique de l'ancienne application :

1. Identifier la configuration utilisée dans `dashboard.js` :
   ```javascript
   options: chartOptions.chartClassicBarNoLegend
   ```

2. Ajouter la propriété `chartPreset` dans l'indicateur :
   ```javascript
   chartPreset: 'chartClassicBarNoLegend'
   ```

3. Supprimer les options personnalisées redondantes (déjà incluses dans le preset)

4. Conserver uniquement les options spécifiques (ex: `indexAxis: 'y'`)

## 🚀 Exemple Complet

```javascript
// Ancienne application (dashboard.js)
var optionsChart1 = {
  chart: {
    type: 'bar',
    options: chartOptions.chartClassicBarNoLegend,
    // ...
  },
  data: {
    mesure: ['pop'],
    // ...
  }
}

// Nouvelle application (indicators/demographie.js)
{
  id: 'demo-evol-pop',
  label: 'Évolution du nombre d\'habitants',
  chartType: 'bar',
  chartPreset: 'chartClassicBarNoLegend', // ← Équivalent
  apiField: 'pop',
  groupBy: 'annee',
  dataSource: 'evolution_population',
  available: true
}
```

