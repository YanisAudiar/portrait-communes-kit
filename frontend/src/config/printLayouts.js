/**
 * Modèle éditorial des planches PDF.
 * Chaque entrée décrit le contenu d'une page thématique :
 * - badge / couleurs : éléments graphiques fixes
 * - summary / texts : paragraphes affichés sous forme de blocs
 * - chartGroups : emplacements définis pour les graphiques (2 colonnes x 2 lignes)
 *
 * Les jeux de données ne sont pas intégrés directement ici.
 * Ils sont fournis par l'utilitaire usePrintData qui mappe les indicateurs API
 * vers les clés `datasetKey` utilisées ci-dessous.
 *
 * Les résumés (summary) sont du contenu éditorial d'instance : à réécrire
 * avec les chiffres du territoire (voir frontend/src/config/site.ts).
 */
import { siteConfig } from './site'

export const printLayouts = {
  demographie: {
    badge: '9',
    themeTag: 'Démographie',
    title: 'Composition des ménages',
    subtitle: 'Population, décomposition de l’évolution, structure par âge et ménages',
    color: '#7067A3',
    summary: `En 2020, 221 715 ménages de Rennes Métropole sont composés de personnes vivant seules.
23% sont des couples sans enfant et 21% des couples avec enfant(s).`,
    chartGroups: [
      {
        title: 'Structure des ménages',
        description: 'Répartition actuelle des types de ménages et évolution de leur taille moyenne.',
        charts: [
          {
            id: 'repartition-menages',
            title: 'Répartition du nombre de ménages par type',
            type: 'doughnut',
            datasetKey: 'demographie.repartitionTypes',
            showLegend: true
          },
          {
            id: 'taille-menages',
            title: 'Évolution de la taille moyenne des ménages',
            type: 'bar',
            datasetKey: 'demographie.tailleMoyenne',
            showLegend: false,
            printWidth: 460,
            chartOptions: {
              scales: {
                x: {
                  ticks: { font: { size: 11 } }
                },
                y: {
                  beginAtZero: true,
                  ticks: { font: { size: 11 } }
                }
              }
            }
          }
        ],
        text: `Le desserrement des ménages s’est ralenti depuis 1999.
La taille moyenne continue néanmoins à diminuer pour atteindre 2,02 personnes en 2020 contre 2,06 en 2014.`
      },
      {
        title: 'Dynamiques récentes',
        description: 'Comparaison des évolutions par type de ménage et avec d’autres métropoles.',
        charts: [
          {
            id: 'evolution-menages',
            title: 'Évolution du nombre de ménages par type',
            type: 'bar',
            datasetKey: 'demographie.evolutionTypes',
            showLegend: true,
            chartOptions: {
              scales: {
                x: {
                  ticks: { font: { size: 10 } }
                },
                y: {
                  beginAtZero: true,
                  ticks: { font: { size: 10 } }
                }
              }
            }
          },
          {
            id: 'comparatif-menages',
            title: 'Taille moyenne des ménages en 2020 – panel de métropoles',
            type: 'bar',
            datasetKey: 'demographie.comparatifMetropoles',
            showLegend: false,
            chartOptions: {
              indexAxis: 'y',
              scales: {
                y: {
                  ticks: { font: { size: 10 } }
                }
              }
            }
          }
        ],
        text: `Les ménages rennais restent plus grands que dans plusieurs métropoles françaises,
mais moins qu’à Strasbourg ou Grenoble.`
      }
    ],
    footnote: 'Source : Insee – Recensement de la population (RP)'
  }
}

/**
 * Fonction utilitaire : retourne la configuration d’un thème donné.
 * Si aucune configuration spécifique n’est définie, on renvoie un modèle simple
 * basé sur les informations de base du thème (libellé, couleur).
 */
export const getPrintLayout = (theme) => {
  if (!theme || !theme.id) {
    return null
  }

  const layout = printLayouts[theme.id]

  if (layout) {
    return layout
  }

  return {
    badge: null,
    themeTag: theme.label,
    title: theme.label,
    subtitle: theme.description || '',
    color: theme.color || '#316D7B',
    chartGroups: [
      {
        title: theme.label,
        charts: [
          {
            id: `${theme.id}-overview`,
            title: 'Visualisation générale',
            type: 'bar',
            datasetKey: `${theme.id}.default`,
            showLegend: true
          }
        ],
        text: ''
      }
    ],
    footnote: `Source : ${siteConfig.agency.name}`
  }
}

