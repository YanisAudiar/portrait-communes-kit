import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fileURLToPath } from 'node:url'
import { GeoServerService } from '../services/geoserver'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

describe('GeoServerService - Critical Bug Regression Tests', () => {
  let geoServerService: GeoServerService

  beforeEach(() => {
    process.env.GEOSERVER_URL = 'https://geoserver.test/ows'
    process.env.GEOSERVER_NAMESPACE = 'testns'
    delete process.env.COMMUNES_GEOJSON_PATH
    geoServerService = new GeoServerService()
    vi.clearAllMocks()
  })

  describe('getCommuneByCode - Bug Fix: Always returned Orgères (35208)', () => {
    it('should apply CQL filter for specific commune code', async () => {
      // Mock successful response with specific commune
      const mockResponse = {
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {
              code_insee_concat: '35001',
              lib_com: 'Acigné',
              id_com: 1
            },
            geometry: {}
          }]
        }
      }
      
      mockedAxios.get.mockResolvedValue(mockResponse)
      
      await geoServerService.getCommuneByCode('35001')
      
      // Verify CQL filter is applied with correct code
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            CQL_FILTER: "code_insee_concat='35001'"
          })
        })
      )
    })

    it('should return Rennes (35238) when requested, not Orgères (35208)', async () => {
      const mockResponse = {
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {
              code_insee_concat: '35238',
              lib_com: 'Rennes',
              id_com: 238
            },
            geometry: {}
          }]
        }
      }
      
      mockedAxios.get.mockResolvedValue(mockResponse)
      
      const result = await geoServerService.getCommuneByCode('35238')
      
      expect(result.features).toHaveLength(1)
      expect(result.features[0].properties.code).toBe('35238')
      expect(result.features[0].properties.nom).toBe('Rennes')
    })

    it('should return Pacé (35206) when requested, not defaulting to Orgères', async () => {
      const mockResponse = {
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {
              code_insee_concat: '35206',
              lib_com: 'Pacé',
              id_com: 206
            },
            geometry: {}
          }]
        }
      }
      
      mockedAxios.get.mockResolvedValue(mockResponse)
      
      const result = await geoServerService.getCommuneByCode('35206')
      
      expect(result.features[0].properties.code).toBe('35206')
      expect(result.features[0].properties.nom).toBe('Pacé')
    })

    it('should return empty features for non-existent code', async () => {
      const mockResponse = {
        data: {
          type: 'FeatureCollection',
          features: []
        }
      }
      
      mockedAxios.get.mockResolvedValue(mockResponse)
      
      const result = await geoServerService.getCommuneByCode('99999')
      
      expect(result.features).toHaveLength(0)
    })

    it('should cache results per commune code, not globally', async () => {
      // First call for 35001
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          type: 'FeatureCollection',
          features: [{ properties: { code_insee_concat: '35001', lib_com: 'Acigné' } }]
        }
      })
      
      // Second call for 35238
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          type: 'FeatureCollection',
          features: [{ properties: { code_insee_concat: '35238', lib_com: 'Rennes' } }]
        }
      })
      
      const result1 = await geoServerService.getCommuneByCode('35001')
      const result2 = await geoServerService.getCommuneByCode('35238')
      
      expect(result1.features[0].properties.code).toBe('35001')
      expect(result2.features[0].properties.code).toBe('35238')
    })
  })

  describe('buildWFSParams - Verify CQL filter construction', () => {
    it('should not include CQL_FILTER when codeInsee is not provided', () => {
      const layer = { path: 'test_layer', id: 'test' } as any
      const params = geoServerService.buildWFSParams(layer, {})
      
      expect(params.CQL_FILTER).toBeUndefined()
    })

    it('should include CQL_FILTER when codeInsee is provided', () => {
      const layer = { path: 'test_layer', id: 'test' } as any
      const params = geoServerService.buildWFSParams(layer, { codeInsee: '35001' })
      
      expect(params.CQL_FILTER).toBe("code_insee_concat='35001'")
    })

    it('should reject malicious input in CQL filter', () => {
      const layer = { path: 'test_layer', id: 'test' } as any

      expect(() =>
        geoServerService.buildWFSParams(layer, { codeInsee: "35'001" })
      ).toThrow('Code INSEE invalide')
    })
  })
})

describe('GeoServerService - Cle de cache bornee (protection memoire)', () => {
  let service: GeoServerService

  beforeEach(() => {
    service = new GeoServerService()
  })

  const layer = { path: 'v_geo_communes_rm_portrait_com', id: 'communes' } as any

  it('should ignore free-text options that do not affect the WFS request', () => {
    // territoire / epci / bbox / precision ne sont pas utilises par buildWFSParams :
    // les laisser entrer dans la cle permettait de stocker N copies de la meme reponse.
    const base = service.buildCacheKey('communes', layer, {})

    expect(service.buildCacheKey('communes', layer, { territoire: 'Rennes' })).toBe(base)
    expect(service.buildCacheKey('communes', layer, { territoire: 'nimporte quoi' })).toBe(base)
    expect(service.buildCacheKey('communes', layer, { epci: 'Rennes Metropole' })).toBe(base)
    expect(service.buildCacheKey('communes', layer, { bbox: [1, 2, 3, 4] })).toBe(base)
    expect(service.buildCacheKey('communes', layer, { precision: 'high' })).toBe(base)
    expect(service.buildCacheKey('communes', layer, { departement: '35' })).toBe(base)
  })

  it('should still separate cache entries per commune code', () => {
    const k1 = service.buildCacheKey('communes', layer, { codeInsee: '35238' })
    const k2 = service.buildCacheKey('communes', layer, { codeInsee: '35206' })

    expect(k1).not.toBe(k2)
  })

  it('should separate cache entries per feature limit and projection', () => {
    const base = service.buildCacheKey('communes', layer, {})

    expect(service.buildCacheKey('communes', layer, { maxFeatures: 50 })).not.toBe(base)
    expect(service.buildCacheKey('communes', layer, { outputProjection: 'EPSG:2154' })).not.toBe(base)
  })

  it('should keep the layer table name in the key', () => {
    const other = { path: 'autre_table', id: 'communes' } as any

    expect(service.buildCacheKey('communes', layer, {})).not.toBe(
      service.buildCacheKey('communes', other, {})
    )
  })
})

describe('GeoServerService - pas de defaut Audiar', () => {
  const originalUrl = process.env.GEOSERVER_URL
  const originalNs = process.env.GEOSERVER_NAMESPACE
  const originalLayer = process.env.GEOSERVER_COMMUNES_LAYER

  afterEach(() => {
    process.env.GEOSERVER_URL = originalUrl
    process.env.GEOSERVER_NAMESPACE = originalNs
    process.env.GEOSERVER_COMMUNES_LAYER = originalLayer
  })

  it('ne pointe pas vers geoserver.audiar.org ni le namespace dataudiar si env absent', () => {
    delete process.env.GEOSERVER_URL
    delete process.env.GEOSERVER_NAMESPACE
    delete process.env.GEOSERVER_COMMUNES_LAYER

    const service = new GeoServerService()

    expect(service.config.url).not.toContain('audiar.org')
    expect(service.config.namespace).not.toBe('dataudiar')
    expect(service.config.layers.communes.path).not.toBe('v_geo_communes_rm_portrait_com')
  })

  it('refuse d’appeler WFS tant que GEOSERVER_URL manque', async () => {
    delete process.env.GEOSERVER_URL
    delete process.env.COMMUNES_GEOJSON_PATH

    const service = new GeoServerService()

    await expect(service.getCommuneByCode('35001')).rejects.toThrow(/GEOSERVER_URL|COMMUNES_GEOJSON_PATH/)
  })
})

describe('GeoServerService - fichier GeoJSON local (kit agences)', () => {
  const originalUrl = process.env.GEOSERVER_URL
  const originalPath = process.env.COMMUNES_GEOJSON_PATH
  const fixture = fileURLToPath(new URL('./fixtures/communes-sample.geojson', import.meta.url))

  afterEach(() => {
    process.env.GEOSERVER_URL = originalUrl
    if (originalPath === undefined) {
      delete process.env.COMMUNES_GEOJSON_PATH
    } else {
      process.env.COMMUNES_GEOJSON_PATH = originalPath
    }
  })

  it('lit les communes depuis un GeoJSON sans appeler WFS', async () => {
    delete process.env.GEOSERVER_URL
    process.env.COMMUNES_GEOJSON_PATH = fixture

    const service = new GeoServerService()
    const result = await service.getFeatures('communes')

    expect(mockedAxios.get).not.toHaveBeenCalled()
    expect(result.features).toHaveLength(3)
    expect(result.features.map((f: { properties: { nom: string } }) => f.properties.nom)).toEqual(
      expect.arrayContaining(['Nordville', 'Sudville', 'Estville'])
    )
  })

  it('filtre une commune par code INSEE depuis le GeoJSON', async () => {
    delete process.env.GEOSERVER_URL
    process.env.COMMUNES_GEOJSON_PATH = fixture

    const service = new GeoServerService()
    const result = await service.getCommuneByCode('99102')

    expect(mockedAxios.get).not.toHaveBeenCalled()
    expect(result.features).toHaveLength(1)
    expect(result.features[0].properties.code).toBe('99102')
    expect(result.features[0].properties.nom).toBe('Sudville')
  })
})
