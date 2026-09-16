/**
 * Fonctions de normalisation des données avant la génération de graphiques.
 * Extraites de useThemeCharts pour garder le composable sous 200 lignes.
 */

/** Champs possibles contenant l'année dans les données */
export const YEAR_FIELDS = ['annee', 'numero_annee', 'annee_construction', 'annee_ventes']

/**
 * Extrait l'année maximale des données pour l'afficher dans le titre
 */
export function getMaxYearFromData(data: unknown[], yearFields: string[] = YEAR_FIELDS): number | null {
  if (!Array.isArray(data) || data.length === 0) return null
  let maxYear: number | null = null
  for (const item of data) {
    if (item && typeof item === 'object') {
      for (const field of yearFields) {
        const val = (item as Record<string, unknown>)[field]
        if (val != null && val !== '') {
          const num = parseInt(String(val), 10)
          if (!Number.isNaN(num) && num > 1000 && num < 2100) {
            maxYear = maxYear === null ? num : Math.max(maxYear, num)
          }
        }
      }
    }
  }
  return maxYear
}

/** Première année à 4 chiffres dans un libellé de période (ex. « 2011-2017 » → 2011) */
function extractFirstYearFromPeriod(val: unknown): number {
  const s = String(val ?? '')
  const m = s.match(/(19|20)\d{2}/)
  return m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER
}

const PERIODES_INTERCENSITAIRES_TYPIQUES = ['1999-2007', '2007-2011', '2011-2017', '2017-2023']

/**
 * Si le champ de période (borne_temporelle, borne_temp…) est un indice (0, 1, 2…) sans plage d'années,
 * le remplacer par une plage lisible. Ordre aligné sur les séries Insee habituelles (intercensitaires).
 */
function normalizeBorneStylePeriodField(rows: unknown[], field: string): unknown[] {
  if (!Array.isArray(rows) || rows.length === 0) return rows
  return rows.map((row) => {
    if (!row || typeof row !== 'object') return row
    const r = row as Record<string, unknown>
    const raw = r[field]
    const s = String(raw ?? '').trim()
    if (/(19|20)\d{2}/.test(s)) {
      return row
    }
    if (/^\d+$/.test(s)) {
      const idx = parseInt(s, 10)
      if (idx >= 0 && idx < PERIODES_INTERCENSITAIRES_TYPIQUES.length) {
        return { ...r, [field]: PERIODES_INTERCENSITAIRES_TYPIQUES[idx] }
      }
    }
    if (/^\d+\.0+$/.test(s)) {
      const head = s.split('.')[0]
      if (head === undefined) return row
      const idx = parseInt(head, 10)
      if (idx >= 0 && idx < PERIODES_INTERCENSITAIRES_TYPIQUES.length) {
        return { ...r, [field]: PERIODES_INTERCENSITAIRES_TYPIQUES[idx] }
      }
    }
    return row
  })
}

/** Soldes naturel / migratoire : libellés d’axe = borne_temporelle */
export function normalizeSoldeNaturelMigratoireRows(rows: unknown[]): unknown[] {
  return normalizeBorneStylePeriodField(rows, 'borne_temporelle')
}

/** Tri chronologique sur la première année du libellé de période (ex. 2011-2017). */
export function sortRowsByPeriodField(rows: unknown[], field: string): unknown[] {
  return [...rows].sort((a, b) => {
    const ba = (a as Record<string, unknown>)?.[field]
    const bb = (b as Record<string, unknown>)?.[field]
    return extractFirstYearFromPeriod(ba) - extractFirstYearFromPeriod(bb)
  })
}

export function sortSoldeRowsByChronology(rows: unknown[]): unknown[] {
  return sortRowsByPeriodField(rows, 'borne_temporelle')
}

/**
 * Applique toutes les normalisations nécessaires sur les données
 * en fonction du dataSource et du groupBy de l'indicateur.
 */
export function normalizeDataSource(
  dataSource: unknown[],
  dataSourceKey: string,
  groupBy?: string
): unknown[] {
  let data = dataSource

  // Pyramide des âges : le sélecteur d’année lit numero_annee — harmoniser avec annee si besoin
  if (dataSourceKey === 'pyramide_ages') {
    data = data.map((value: unknown) => {
      const item = value as Record<string, unknown>
      return item.numero_annee === undefined && item.annee !== undefined
        ? { ...item, numero_annee: item.annee }
        : item
    })
  }

  // Soldes démo : plages d'années lisibles + ordre chronologique
  if (dataSourceKey === 'solde_naturel_migratoire') {
    data = sortSoldeRowsByChronology(normalizeSoldeNaturelMigratoireRows(data))
  }

  // evolution_population : extraire l'année de borne_temp si annee est null (graphique habitants en années)
  if (dataSourceKey === 'evolution_population') {
    data = data.map((value: unknown) => {
      const item = value as Record<string, unknown>
      if ((item.annee === null || item.annee === undefined) && item.borne_temp) {
        const match = String(item.borne_temp).match(/-(\d{4})\s*$/)
        const y = match?.[1]
        if (y !== undefined) {
          return { ...item, annee: parseInt(y, 10) }
        }
      }
      return item
    })
    // TCAN : axe = libellés tels qu’en base (borne_temp), sans plages figées côté front ; tri chronologique seulement
    if (groupBy === 'borne_temp') {
      data = sortRowsByPeriodField(data, 'borne_temp')
    }
  }

  // Habitat : harmoniser annee/numero_annee
  if (dataSourceKey === 'logements_commences' && groupBy === 'annee') {
    data = data.map((value: unknown) => {
      const item = value as Record<string, unknown>
      return item.annee === undefined && item.numero_annee !== undefined
        ? { ...item, annee: item.numero_annee }
        : item
    })
  }
  if (dataSourceKey === 'evol_logts_commences' && groupBy === 'numero_annee') {
    data = data.map((value: unknown) => {
      const item = value as Record<string, unknown>
      return item.numero_annee === undefined && item.annee !== undefined
        ? { ...item, numero_annee: item.annee }
        : item
    })
  }

  // Démographie evolution_age : périodes intercensitaires + tri chronologique
  if (
    dataSourceKey === 'evolution_age' &&
    (groupBy === 'numero_annee' || groupBy === 'periode_intercensitaire')
  ) {
    data = data
      .map((value: unknown) => {
        let row = value as Record<string, unknown>
        if (row.numero_annee === undefined && row.annee !== undefined) {
          row = { ...row, numero_annee: row.annee }
        }
        if (
          groupBy === 'periode_intercensitaire' &&
          (row.periode_intercensitaire === undefined || row.periode_intercensitaire === '') &&
          row.numero_annee != null
        ) {
          row = { ...row, periode_intercensitaire: String(row.numero_annee) }
        }
        return row
      })
      .sort((a: unknown, b: unknown) => {
        const ra = a as Record<string, unknown>
        const rb = b as Record<string, unknown>
        const ya = parseInt(String(ra.numero_annee ?? ra.annee), 10) || 0
        const yb = parseInt(String(rb.numero_annee ?? rb.annee), 10) || 0
        return ya - yb
      })
  }

  // Agriculture Évolution ETP : harmoniser annee/numero_annee + tri
  if (dataSourceKey === 'nb_etp' && groupBy === 'annee') {
    data = data
      .map((value: unknown) => {
        const item = value as Record<string, unknown>
        return item.annee === undefined && item.numero_annee !== undefined
          ? { ...item, annee: item.numero_annee }
          : item
      })
      .sort((a: unknown, b: unknown) => {
        const ra = a as Record<string, unknown>
        const rb = b as Record<string, unknown>
        const ya = parseInt(String(ra.annee ?? ra.numero_annee), 10) || 0
        const yb = parseInt(String(rb.annee ?? rb.numero_annee), 10) || 0
        return ya - yb
      })
  }

  return data
}
