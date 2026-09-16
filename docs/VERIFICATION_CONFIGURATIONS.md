# Vérification des Configurations d'Indicateurs

## Correspondance Backend ↔ Frontend

### ✅ Démographie

| Clé Backend | Utilisé dans Config | Indicateur |
|-------------|---------------------|------------|
| `evolution_population` | ✅ Oui | demo-evol-pop, demo-taux-evol |
| `naissances_deces` | ✅ Oui | demo-naissances-deces |
| `solde_naturel_migratoire` | ✅ Oui | demo-solde-naturel-migratoire |
| `pyramide_ages` | ✅ Oui | demo-pyramide |
| `indice_jeunesse` | ✅ Oui | demo-indice-jeunesse |
| `repartition_menages` | ✅ Oui | demo-repartition-menages |
| `taille_menages` | ✅ Oui | demo-taille-menages |
| `indicateurs_age` | ⚠️ Non | (Peut être utilisé pour KPIs) |

### ✅ Habitat

| Clé Backend | Utilisé dans Config | Indicateur |
|-------------|---------------------|------------|
| `statut_occupation` | ✅ Oui | habitat-statut-occupation |
| `evol_rp` | ✅ Oui | habitat-evol-rp |
| `logements_commences` | ✅ Oui | habitat-logements-commences |
| `ventes_occasion` | ✅ Oui | habitat-ventes-occasion |
| `indicateurs_logements` | ⚠️ **Nouveau** | (Non utilisé - disponible pour KPIs) |
| `indicateurs_occasion` | ⚠️ **Nouveau** | (Non utilisé - disponible pour KPIs) |
| `indicateurs_logt_commences` | ⚠️ **Nouveau** | (Non utilisé - disponible pour KPIs) |

### ✅ Économie

| Clé Backend | Utilisé dans Config | Indicateur |
|-------------|---------------------|------------|
| `creation_etablissements_type` | ✅ Oui | eco-creation-etablissements-type |
| `evol_creation_etablissements` | ✅ Oui | eco-evol-creation-etablissements |
| `evol_emploi_total` | ✅ Oui | emploi-evol-total |
| `repartition_csp` | ✅ Oui | emploi-repartition-csp |
| `repartition_secteur` | ✅ Oui | emploi-repartition-secteur |
| `repartition_lieu_travail` | ✅ Oui | emploi-lieu-travail |
| `surface_locaux_activite` | ⚠️ **Nouveau** | (Non utilisé - disponible pour KPIs) |

### ✅ Formation

| Clé Backend | Utilisé dans Config | Indicateur |
|-------------|---------------------|------------|
| `evol_premier_degre` | ✅ Oui | formation-evol-premier-degre |
| `evol_second_degre` | ✅ Oui | formation-evol-second-degre |
| `indicateurs_primaire` | ⚠️ **Nouveau** | (Non utilisé - disponible pour KPIs) |
| `indicateurs_secondaire` | ⚠️ **Nouveau** | (Non utilisé - disponible pour KPIs) |

### ✅ Solidarité

| Clé Backend | Utilisé dans Config | Indicateur |
|-------------|---------------------|------------|
| `revenus_disponibles` | ✅ Oui | solid-revenus-disponibles |
| `origine_revenus` | ✅ Oui | solid-origine-revenus |

## Résumé

- ✅ **Toutes les clés utilisées dans les configurations existent dans le backend**
- ✅ **Toutes les données de l'ancienne application sont maintenant disponibles**
- ⚠️ **Nouvelles données ajoutées disponibles pour utilisation future (KPIs, indicateurs supplémentaires)**

## Données Ajoutées (Disponibles mais non configurées)

Ces données sont maintenant disponibles dans le backend mais ne sont pas encore utilisées dans les configurations d'indicateurs. Elles peuvent être utilisées pour :

1. **KPIs** (Indicateurs clés en haut de page)
2. **Nouveaux graphiques** si nécessaire
3. **Données de contexte** pour les descriptions

### Habitat
- `indicateurs_logements` : Nombre de logements, part maisons individuelles, part propriétaires occupants
- `indicateurs_occasion` : Nombre de logements vendus, moyenne 4 ans, part collectif
- `indicateurs_logt_commences` : Nombre de logements commencés, moyenne 4 ans

### Économie
- `surface_locaux_activite` : Surface des locaux d'activité autorisés

### Formation
- `indicateurs_primaire` : Nombre d'élèves, nombre de classes, évolution 4 ans (primaire)
- `indicateurs_secondaire` : Nombre d'élèves second degré

## Conclusion

✅ **Toutes les configurations sont correctes et utilisent les bonnes clés de données.**

Les nouvelles données ajoutées sont disponibles pour une utilisation future si nécessaire.

