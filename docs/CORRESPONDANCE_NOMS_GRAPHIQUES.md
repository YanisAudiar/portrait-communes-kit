# Correspondance des Noms et Graphiques - Ancienne vs Nouvelle Application

## Démographie

### KPIs (Indicateurs Clés)

| Ancienne App (Classe CSS) | Label Ancienne App | Nouvelle App (KPI) | Statut |
|---------------------------|-------------------|-------------------|--------|
| `.population` | "Nombre d'habitants en {année}" | À créer | ⚠️ |
| `.tx-evol-pop` | "Taux d'évolution par an sur la période {borne_temp}" | À créer | ⚠️ |
| `.gain-annuel-pop` | "Gain d'habitants par an sur la période {borne_temp}" | À créer | ⚠️ |
| `.gain-population` | "Évolution annuelle moyenne du nombre d'habitants sur la période {borne_temp}" | À créer | ⚠️ |
| `.gain-solde-naturel` | "Évolution liée au solde naturel sur cette période" | À créer | ⚠️ |
| `.gain-solde-migratoire` | "Évolution liée au solde migratoire sur cette période" | À créer | ⚠️ |
| `.part-m20ans` | "Part des moins de 20 ans en {année}" | À créer | ⚠️ |
| `.part-p60ans` | "Part des plus de 60 ans en {année}" | À créer | ⚠️ |
| `.indice-jeunesse` | "Indice de jeunesse en {année}" | À créer | ⚠️ |
| `.nb-menages` | "Nombre de ménages en {année}" | À créer | ⚠️ |
| `.taille-moy-menages` | "Taille moyenne des ménages en {année}" | À créer | ⚠️ |
| `.part-personnes-seules` | "Part des personnes seules en {année}" | À créer | ⚠️ |

### Graphiques

| Chart ID | Titre Ancienne App | Type | Source | Nouvelle App | Statut |
|----------|-------------------|------|--------|-------------|--------|
| `chart-1` | "Évolution du nombre d'habitants" | bar | Insee | demo-evol-pop | ✅ |
| `chart-2` | "Taux d'évolution annuel moyen" | bar | Insee | demo-taux-evol | ✅ |
| `chart-3` | "Évolution du nombre de naissances et de décès domiciliés" | line | Insee, état civil | demo-naissances-deces | ✅ |
| `chart-4` | "Évolution démographique annuelle moyenne" | horizontalBar | Insee, état civil | demo-solde-naturel-migratoire | ✅ |
| `chart-5` | "Pyramide des âges" | horizontalBar | Insee | demo-pyramide | ✅ |
| `chart-6` | "Évolution de l'indice de jeunesse" | bar | Insee | demo-indice-jeunesse | ✅ |
| `chart-7` | "Répartition du nombre de ménages par types en {année}" | doughnut | Insee | demo-repartition-menages | ✅ |
| `chart-8` | "Évolution de la taille moyenne des ménages" | bar | Insee | demo-taille-menages | ✅ |

## Habitat

### KPIs

| Ancienne App (Classe CSS) | Label Ancienne App | Nouvelle App (KPI) | Statut |
|---------------------------|-------------------|-------------------|--------|
| `.nb-log` | "Nombre de logements dans le parc en {année}" | À créer | ⚠️ |
| `.tx-prop-occup` | "Part des propriétaires occupants en {année}" | À créer | ⚠️ |
| `.tx-maison-ind` | "Part des maisons individuelles parmi les résidences principales en {année}" | À créer | ⚠️ |
| `.nb-log-neuf-commences` | "Nombre de logements neufs commencés en date de prise en compte en {année}" | À créer | ⚠️ |
| `.nb-log-occasion-vendus` | "Nombre de logements d'occasion vendus en moyenne au cours des 4 dernières années" | À créer | ⚠️ |
| `.nb-transactions-m4` | "Part du collectif dans cette moyenne sur 4 ans en date de prise en compte" | À créer | ⚠️ |

### Graphiques

| Chart ID | Titre Ancienne App | Type | Source | Nouvelle App | Statut |
|----------|-------------------|------|--------|-------------|--------|
| `chart-habitat-1` | "Répartition du nombre de logements selon le statut d'occupation en {année}" | doughnut | Insee | habitat-statut-occupation | ✅ |
| `chart-habitat-2` | "Évolution du nombre de résidences principales" | bar | Insee | habitat-evol-rp | ✅ |
| `chart-habitat-3` | "Évolution du nombre de logements neufs commencés" | bar | Sit@adel2, Audiar | habitat-logements-commences | ✅ |
| `chart-habitat-4` | "Évolution du nombre de logements d'occasion vendus par type" | bar (stacked) | DVF, Audiar | habitat-ventes-occasion | ✅ |

## Économie

### KPIs

| Ancienne App (Classe CSS) | Label Ancienne App | Nouvelle App (KPI) | Statut |
|---------------------------|-------------------|-------------------|--------|
| `.nb-etab` | "Nombre de créations d'établissements en {année}" | À créer | ⚠️ |
| `.tx-crea-etab` | "Taux de création d'établissements en {année}" | À créer | ⚠️ |
| `.surf-loc-aut` | "Surface des locaux d'activité autorisés en {année}" | À créer | ⚠️ |
| `.nb-emplois` | "Nombre d'emplois total en {année}" | À créer | ⚠️ |
| `.tx-evol-emploi` | "Taux d'évolution des emplois sur la période {borne_temp}" | À créer | ⚠️ |
| `.part-emploi-agricole` | "Part de l'emploi agricole en {année}" | À créer | ⚠️ |

### Graphiques

| Chart ID | Titre Ancienne App | Type | Source | Nouvelle App | Statut |
|----------|-------------------|------|--------|-------------|--------|
| `chart-eco-1` | "Répartition du nombre de créations d'établissements par type d'activité en {année}" | doughnut | Insee, REE | eco-creation-etablissements-type | ✅ |
| `chart-eco-2` | "Évolution du nombre de créations d'établissements" | bar | Insee, REE | eco-evol-creation-etablissements | ✅ |
| `chart-emploi-1` | "Évolution du nombre d'emplois total" | bar | Insee, estimations d'emploi | emploi-evol-total | ✅ |
| `chart-emploi-2` | "Répartition des emplois par catégorie socioprofessionnelle en {année}" | doughnut | Insee, estimations d'emploi | emploi-repartition-csp | ✅ |
| `chart-emploi-3` | "Répartition des emplois par secteur d'activité en {année}" | doughnut | Insee, estimations d'emploi | emploi-repartition-secteur | ✅ |
| `chart-emploi-4` | "Répartition des actifs en emploi par lieu de travail en {année}" | doughnut | Insee, RP | emploi-lieu-travail | ✅ |

## Formation

### KPIs

| Ancienne App (Classe CSS) | Label Ancienne App | Nouvelle App (KPI) | Statut |
|---------------------------|-------------------|-------------------|--------|
| `.nb-eleves-premier-degre` | "Nombre d'élèves du premier degré en {année}" | À créer | ⚠️ |
| `.evol-nb-eleves` | "Taux d'évolution du nombre d'élèves sur la période {borne_temp}" | À créer | ⚠️ |
| `.nb-eleves-second-degre` | "Nombre d'élèves du second degré en {année}" | À créer | ⚠️ |

### Graphiques

| Chart ID | Titre Ancienne App | Type | Source | Nouvelle App | Statut |
|----------|-------------------|------|--------|-------------|--------|
| `chart-formation-1` | "Évolution du nombre d'élèves du premier degré" | line | Académie de Rennes | formation-evol-premier-degre | ✅ |
| `chart-formation-2` | "Évolution du nombre d'élèves du second degré" | line | Académie de Rennes | formation-evol-second-degre | ✅ |

## Solidarité

### KPIs

| Ancienne App (Classe CSS) | Label Ancienne App | Nouvelle App (KPI) | Statut |
|---------------------------|-------------------|-------------------|--------|
| `.revenu-dispo-median-uc` | "Revenu disponible médian par UC en {année}" | À créer | ⚠️ |
| `.part-men-fisc-impose` | "Part des ménages fiscaux imposés en {année}" | À créer | ⚠️ |
| `.tx-pauvrete-60` | "Taux de pauvreté au seuil de 60% en {année}" | À créer | ⚠️ |

### Graphiques

| Chart ID | Titre Ancienne App | Type | Source | Nouvelle App | Statut |
|----------|-------------------|------|--------|-------------|--------|
| `chart-solidarite-1` | "Revenus disponibles par UC en {année}" | horizontalBar | Insee, FiLoSoFi | solid-revenus-disponibles | ✅ |
| `chart-solidarite-2` | "Origine des revenus disponibles par UC en {année}" | horizontalBar | Insee, FiLoSoFi | solid-origine-revenus | ✅ |

## Actions Requises

1. ✅ **Graphiques** : Tous les graphiques sont configurés correctement
2. ⚠️ **KPIs** : Les KPIs doivent être recalculés à partir des données réelles de l'API (pas depuis communeData qui ne contient pas toutes les données)
3. ⚠️ **Titres** : Vérifier que les titres des graphiques correspondent exactement
4. ⚠️ **Sources** : Vérifier que les sources affichées correspondent

