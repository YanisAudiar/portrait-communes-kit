# Résumé de Correspondance - Graphiques et KPIs

## ✅ État Actuel

### KPIs (Indicateurs Clés)
- ✅ **Recalculés à partir des données réelles** de l'API (`chartData`)
- ✅ **Labels identiques** à l'ancienne application
- ✅ **Calculs basés sur la même logique** que `dashboard.js`

### Graphiques (Charts)
- ✅ **Tous les graphiques configurés** avec les mêmes titres
- ✅ **Mêmes sources de données** utilisées
- ✅ **Types de graphiques identiques** (bar, line, doughnut, horizontalBar)

## 📊 Correspondance Complète des Graphiques

### Démographie

| # | Ancienne App | Nouvelle App | Type | Source | Statut |
|---|--------------|--------------|------|--------|--------|
| 1 | Évolution du nombre d'habitants | Évolution du nombre d'habitants | bar | Insee | ✅ |
| 2 | Taux d'évolution annuel moyen | Taux d'évolution annuel moyen | bar | Insee | ✅ |
| 3 | Évolution du nombre de naissances et de décès domiciliés | Évolution du nombre de naissances et de décès domiciliés | line | Insee, état civil | ✅ |
| 4 | Évolution démographique annuelle moyenne | Évolution démographique annuelle moyenne | horizontalBar | Insee, état civil | ✅ |
| 5 | Pyramide des âges | Pyramide des âges | horizontalBar | Insee | ✅ |
| 6 | Évolution de l'indice de jeunesse | Évolution de l'indice de jeunesse | bar | Insee | ✅ |
| 7 | Répartition du nombre de ménages par types en {année} | Répartition du nombre de ménages par types | doughnut | Insee | ✅ |
| 8 | Évolution de la taille moyenne des ménages | Évolution de la taille moyenne des ménages | bar | Insee | ✅ |

**Note** : Le graphique #7 inclut l'année dynamiquement dans l'ancienne app. Dans la nouvelle app, l'année peut être ajoutée dans la description si nécessaire.

### Habitat

| # | Ancienne App | Nouvelle App | Type | Source | Statut |
|---|--------------|--------------|------|--------|--------|
| 1 | Répartition du nombre de logements selon le statut d'occupation en {année} | Répartition du nombre de logements selon le statut d'occupation | doughnut | Insee | ✅ |
| 2 | Évolution du nombre de résidences principales | Évolution du nombre de résidences principales | bar | Insee | ✅ |
| 3 | Évolution du nombre de logements neufs commencés | Évolution du nombre de logements neufs commencés | bar | Sit@adel2, Audiar | ✅ |
| 4 | Évolution du nombre de logements d'occasion vendus par type | Évolution du nombre de logements d'occasion vendus par type | bar (stacked) | DVF, Audiar | ✅ |

### Économie-Emploi

| # | Ancienne App | Nouvelle App | Type | Source | Statut |
|---|--------------|--------------|------|--------|--------|
| 1 | Répartition du nombre de créations d'établissements par type d'activité en {année} | Répartition du nombre de créations d'établissements par type d'activité | doughnut | Insee, REE | ✅ |
| 2 | Évolution du nombre de créations d'établissements | Évolution du nombre de créations d'établissements | bar | Insee, REE | ✅ |
| 3 | Évolution du nombre d'emplois total | Évolution du nombre d'emplois total | bar | Insee, estimations d'emploi | ✅ |
| 4 | Répartition des emplois par catégorie socioprofessionnelle en {année} | Répartition des emplois par catégorie socioprofessionnelle | doughnut | Insee, estimations d'emploi | ✅ |
| 5 | Répartition des emplois par secteur d'activité en {année} | Répartition des emplois par secteur d'activité | doughnut | Insee, estimations d'emploi | ✅ |
| 6 | Répartition des actifs en emploi par lieu de travail en {année} | Répartition des actifs en emploi par lieu de travail | doughnut | Insee, RP | ✅ |

### Formation

| # | Ancienne App | Nouvelle App | Type | Source | Statut |
|---|--------------|--------------|------|--------|--------|
| 1 | Évolution du nombre d'élèves du premier degré | Évolution du nombre d'élèves du premier degré | line | Académie de Rennes | ✅ |
| 2 | Évolution du nombre d'élèves du second degré | Évolution du nombre d'élèves du second degré | line | Académie de Rennes | ✅ |

### Solidarité

| # | Ancienne App | Nouvelle App | Type | Source | Statut |
|---|--------------|--------------|------|--------|--------|
| 1 | Revenus disponibles par UC en {année} | Revenus disponibles par UC | horizontalBar | Insee, FiLoSoFi | ✅ |
| 2 | Origine des revenus disponibles par UC en {année} | Origine des revenus disponibles par UC | horizontalBar | Insee, FiLoSoFi | ✅ |

## 📋 Correspondance des KPIs

### Démographie
- ✅ Nombre d'habitants en {année}
- ✅ Taux d'évolution par an sur la période {borne_temp}
- ✅ Gain d'habitants par an sur la période {borne_temp}

### Habitat
- ✅ Nombre de logements dans le parc en {année}
- ✅ Part des propriétaires occupants en {année}
- ✅ Part des maisons individuelles parmi les résidences principales en {année}

### Économie-Emploi
- ✅ Nombre de créations d'établissements en {année}
- ✅ Taux de création d'établissements en {année}
- ✅ Nombre d'emplois total en {année}

### Formation
- ✅ Nombre d'élèves du premier degré en {année}
- ✅ Taux d'évolution du nombre d'élèves sur la période {borne_temp}
- ✅ Nombre d'élèves du second degré en {année}

### Solidarité
- ✅ Revenu disponible médian par UC en {année}
- ✅ Part des ménages fiscaux imposés en {année}
- ✅ Taux de pauvreté au seuil de 60% en {année}

## 🔍 Points d'Attention

### Titres avec Année Dynamique
Certains graphiques de l'ancienne application incluent l'année dans le titre :
- "Répartition du nombre de ménages par types en {année}"
- "Répartition du nombre de logements selon le statut d'occupation en {année}"
- "Répartition du nombre de créations d'établissements par type d'activité en {année}"
- etc.

**Solution actuelle** : Les titres sont statiques dans les configurations. L'année peut être ajoutée dynamiquement si nécessaire en modifiant `useThemeCharts.js` pour injecter l'année depuis les données.

### Sources de Données
- ✅ Toutes les sources correspondent exactement
- ✅ Les mêmes vues SQL sont utilisées
- ✅ Les mêmes champs de données sont extraits

## ✅ Conclusion

**Tous les graphiques et KPIs sont maintenant configurés et correspondent à l'ancienne application.**

Les seules différences sont :
1. **Titres statiques** au lieu de titres avec année dynamique (peut être ajouté si nécessaire)
2. **Architecture moderne** Vue.js au lieu de jQuery/Chart.js direct

Les données affichées sont identiques et proviennent des mêmes sources.

