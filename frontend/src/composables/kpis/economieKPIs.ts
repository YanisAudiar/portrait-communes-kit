/**
 * KPIs pour le thème Économie-Emploi
 */
import { type KPI, getMax, filterData, roundDec, groupBySum } from './types'

/** Parse un nombre issu de l'API / PostgreSQL (string, decimal, null). */
function parseMetricNumber(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return NaN
  const n = parseFloat(String(raw).replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

/** Lignes dont l'année correspond exactement à maxYear (évite écarts string/number). */
function rowsForYear(rows: any[], yearField: string, maxYear: number): any[] {
  return rows.filter((row) => parseInt(String(row[yearField]), 10) === maxYear)
}

export function getEconomieKPIs(themeData: any): KPI[] {
  const allKPIs: KPI[] = []

  // --- Sous-thème: Tissu économique ---
  // v_economie_rep_etabl_sect_par_com : nb_etabl_cmna = stock d'établissements par secteur (somme = parc total au millésime)
  const repEtablParSecteur = themeData?.creation_etablissements_type
  if (repEtablParSecteur && repEtablParSecteur.length > 0) {
    const maxYear = getMax(repEtablParSecteur, 'numero_annee')
    if (maxYear !== null) {
      const grouped = groupBySum(
        filterData(repEtablParSecteur, { numero_annee: String(maxYear) }),
        'lib_com',
        'nb_etabl_cmna'
      )
      if (grouped.length > 0) {
        allKPIs.push({
          id: 'eco-nb-etabl',
          value: roundDec(grouped[0].nb_etabl_cmna || 0, 0),
          label: `Nombre d'établissements en ${maxYear}`,
          icon: 'chart',
          format: 'number',
          subtheme: 'Tissu économique'
        })
      }
    }
  }

  // v_economie_evol_crea_etabl_par_com : flux annuel (créations)
  const evolCreation = themeData?.evol_creation_etablissements
  if (evolCreation && evolCreation.length > 0) {
    const maxYear = getMax(evolCreation, 'numero_annee')
    if (maxYear !== null) {
      const lastYearData = rowsForYear(evolCreation, 'numero_annee', maxYear)
      if (lastYearData.length > 0) {
        const totalCrea = lastYearData.reduce((sum, row) => {
          const v = parseMetricNumber(row.nb_crea_etabl)
          return sum + (Number.isFinite(v) ? v : 0)
        }, 0)
        const txRow = lastYearData.find(
          (r) =>
            r.tx_crea_etab != null &&
            String(r.tx_crea_etab).trim() !== ''
        )
        const txParsed = txRow ? parseMetricNumber(txRow.tx_crea_etab) : NaN
        const hasTx = Number.isFinite(txParsed)

        allKPIs.push({
          id: 'eco-nb-crea',
          value: roundDec(totalCrea, 0),
          label: `Nombre de créations d'établissements en ${maxYear}`,
          icon: 'chart',
          format: 'number',
          subtheme: 'Tissu économique'
        })
        // tx_crea_etab peut être NULL (ex. millésime encore provisoire en vue) : ne pas afficher 0 %
        allKPIs.push({
          id: 'eco-tx-crea',
          value: hasTx ? roundDec(txParsed, 2) : 0,
          valueDisplayOverride: hasTx ? undefined : '—',
          label: `Taux de création d'établissements en ${maxYear}`,
          icon: 'trend',
          format: 'percentage',
          decimals: 2,
          subtheme: 'Tissu économique',
          // Masqué pour le lecteur : conserve l’emplacement grille / cohérence des ids ; les KPI Emploi ne remontent pas visuellement à sa place.
          visuallyHidden: true
        })
      }
    }
  }

  const surfaceLocaux = themeData?.surface_locaux_activite
  if (surfaceLocaux && surfaceLocaux.length > 0) {
    const maxYear = getMax(surfaceLocaux, 'numero_annee')
    if (maxYear !== null) {
      const lastYearData = filterData(surfaceLocaux, { numero_annee: String(maxYear) })
      if (lastYearData.length > 0) {
        allKPIs.push({
          id: 'eco-surf-loc',
          value: roundDec(lastYearData[0].surf_loc_aut_m2 || 0, 0),
          label: `Surface locaux d'activité autorisés (m²) en ${maxYear}`,
          icon: 'chart',
          format: 'number',
          subtheme: 'Tissu économique'
        })
      }
    }
  }

  // --- Sous-thème: Emploi ---
  const evolEmploi = themeData?.evol_emploi_total
  if (evolEmploi && evolEmploi.length > 0) {
    const maxYear = getMax(evolEmploi, 'numero_annee')
    if (maxYear !== null) {
      const lastYearData = filterData(evolEmploi, { numero_annee: String(maxYear) })
      if (lastYearData.length > 0) {
        allKPIs.push({
          id: 'eco-nb-empl',
          value: roundDec(lastYearData[0].nb_emplois || 0, 0),
          label: `Nombre d'emplois en ${maxYear}`,
          icon: 'users',
          format: 'number',
          subtheme: 'Emploi'
        })
        if (lastYearData[0].evol_emplois !== undefined) {
          const yearStart = maxYear - 1
          const yearEnd = maxYear
          allKPIs.push({
            id: 'eco-tx-evol-empl',
            value: roundDec(lastYearData[0].evol_emplois || 0, 1),
            label: `Évolution du nombre d'emplois sur un an (${yearStart}-${yearEnd})`,
            icon: 'trend',
            format: 'percentage',
            subtheme: 'Emploi'
          })
        }
      }
    }
  }

  return allKPIs
}
