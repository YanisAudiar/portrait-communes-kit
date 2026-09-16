import { describe, it, expect } from 'vitest'
import { siteConfig, siteConfigAudiar, defaultInseeDepartment } from './site'
import { siteConfigSample } from './site.sample'

describe('siteConfig — contrat territoire / agence', () => {
  it('expose une liste de codes INSEE à 5 chiffres (ou vide = couche GeoServer déjà filtrée)', () => {
    const codes = siteConfig.territory.communeCodes
    expect(Array.isArray(codes)).toBe(true)
    for (const code of codes) {
      expect(code).toMatch(/^\d{5}$/)
    }
  })

  it('définit un centre et une emprise de carte utilisables par MapLibre', () => {
    const [lng, lat] = siteConfig.territory.mapCenter
    expect(lng).toBeGreaterThan(-180)
    expect(lng).toBeLessThan(180)
    expect(lat).toBeGreaterThan(-90)
    expect(lat).toBeLessThan(90)

    const [[west, south], [east, north]] = siteConfig.territory.mapBounds
    expect(west).toBeLessThan(east)
    expect(south).toBeLessThan(north)
  })

  it('porte les champs légaux et de contact de l’agence', () => {
    expect(siteConfig.agency.name.length).toBeGreaterThan(0)
    expect(siteConfig.agency.website).toMatch(/^https?:\/\//)
    expect(siteConfig.agency.contactUrl).toMatch(/^https?:\/\//)
    expect(siteConfig.agency.addressLines.length).toBeGreaterThan(0)
  })

  it('expose un sigle de territoire et un département INSEE utilisable par la carte', () => {
    expect(siteConfig.territory.shortName.length).toBeGreaterThan(0)
    expect(defaultInseeDepartment()).toBe(siteConfig.territory.inseeDepartment || 'all')
  })

  it('est la source unique du centre, de l’emprise et des codes commune pour la carte', async () => {
    const { RENNES_METROPOLE_CODES, MAP_CONFIG } = await import('./mapConfig.js')
    expect(RENNES_METROPOLE_CODES).toBe(siteConfig.territory.communeCodes)
    expect(MAP_CONFIG.defaultCenter).toBe(siteConfig.territory.mapCenter)
    expect(MAP_CONFIG.mapBounds).toBe(siteConfig.territory.mapBounds)
    expect(MAP_CONFIG.bretagneBounds).toBe(siteConfig.territory.mapBounds)
  })

  it('reste l’instance Audiar par défaut (Docker utilise VITE_USE_SAMPLE_TERRITORY)', () => {
    expect(siteConfig).toBe(siteConfigAudiar)
    expect(siteConfig.territory.name).toBe('Rennes Métropole')
  })

  it('expose un territoire d’exemple aligné sur le seed SQL (99101–99103)', () => {
    expect(siteConfigSample.territory.communeCodes).toEqual(['99101', '99102', '99103'])
    expect(siteConfigSample.partner).toBeNull()
  })
})
