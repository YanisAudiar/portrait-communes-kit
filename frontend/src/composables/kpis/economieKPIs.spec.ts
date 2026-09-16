import { describe, it, expect } from 'vitest'
import { getEconomieKPIs } from './economieKPIs'

describe('getEconomieKPIs — créations d’établissements', () => {
  it('expose le nombre de créations et le KPI taux (taux masqué à l’affichage mais présent pour la grille)', () => {
    const themeData = {
      evol_creation_etablissements: [
        { numero_annee: 2021, nb_crea_etabl: 2, tx_crea_etab: '0.037' },
        { numero_annee: 2022, nb_crea_etabl: 1, tx_crea_etab: 0.042 }
      ]
    }
    const kpis = getEconomieKPIs(themeData)
    const nb = kpis.find((k) => k.id === 'eco-nb-crea')
    const tx = kpis.find((k) => k.id === 'eco-tx-crea')
    expect(tx?.visuallyHidden).toBe(true)
    expect(tx?.value).toBe(0.04)
    expect(nb?.value).toBe(1)
  })

  it('somme nb_crea_etabl si plusieurs lignes pour la même année', () => {
    const themeData = {
      evol_creation_etablissements: [
        { numero_annee: 2022, nb_crea_etabl: 1, tx_crea_etab: 1.5 },
        { numero_annee: 2022, nb_crea_etabl: 2, tx_crea_etab: 1.5 }
      ]
    }
    const kpis = getEconomieKPIs(themeData)
    const nb = kpis.find((k) => k.id === 'eco-nb-crea')
    expect(nb?.value).toBe(3)
  })

  it('parse les chaînes numériques issues de PostgreSQL pour nb_crea_etabl', () => {
    const themeData = {
      evol_creation_etablissements: [
        { numero_annee: 2022, nb_crea_etabl: '4', tx_crea_etab: '0.081234567' }
      ]
    }
    const kpis = getEconomieKPIs(themeData)
    const nb = kpis.find((k) => k.id === 'eco-nb-crea')
    expect(nb?.value).toBe(4)
  })

  it('si tx_crea_etab est NULL : KPI taux conservé avec « — », masqué visuellement', () => {
    const themeData = {
      evol_creation_etablissements: [
        { numero_annee: 2021, nb_crea_etabl: 10, tx_crea_etab: 5 },
        { numero_annee: 2022, nb_crea_etabl: 157, tx_crea_etab: null }
      ]
    }
    const kpis = getEconomieKPIs(themeData)
    const tx = kpis.find((k) => k.id === 'eco-tx-crea')
    expect(tx?.valueDisplayOverride).toBe('—')
    expect(tx?.visuallyHidden).toBe(true)
    expect(kpis.find((k) => k.id === 'eco-nb-crea')?.value).toBe(157)
  })
})
