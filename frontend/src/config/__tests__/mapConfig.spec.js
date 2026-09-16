import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, vi, afterEach } from 'vitest'

const MAP_CONFIG_PATH = resolve(__dirname, '../mapConfig.js')

describe('mapConfig - fond de carte sans secret', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('ne contient pas de clé CARTO en dur dans le source', () => {
    const src = readFileSync(MAP_CONFIG_PATH, 'utf8')
    expect(src).not.toMatch(/cb1_2urd/)
    expect(src).not.toMatch(/cartoApiKey\s*=\s*'[^']+'/)
  })

  it('utilise OpenStreetMap quand VITE_CARTO_API_KEY est absente', async () => {
    vi.stubEnv('VITE_CARTO_API_KEY', '')
    vi.resetModules()
    const { MAP_BASEMAP_STYLE_FRAGMENT } = await import('../mapConfig.js')
    const source = Object.values(MAP_BASEMAP_STYLE_FRAGMENT.sources)[0]
    expect(source.tiles.join(' ')).toContain('tile.openstreetmap.org')
    expect(source.tiles.join(' ')).not.toMatch(/[?&]key=/)
    expect(source.tiles.join(' ')).not.toContain('basemaps.cartocdn.com')
  })

  it('ajoute ?key= aux tuiles CARTO quand VITE_CARTO_API_KEY est définie', async () => {
    vi.stubEnv('VITE_CARTO_API_KEY', 'test-carto-key')
    vi.resetModules()
    const { MAP_BASEMAP_STYLE_FRAGMENT } = await import('../mapConfig.js')
    const source = Object.values(MAP_BASEMAP_STYLE_FRAGMENT.sources)[0]
    expect(source.tiles.length).toBeGreaterThan(0)
    for (const tileUrl of source.tiles) {
      expect(tileUrl).toContain('basemaps.cartocdn.com')
      expect(tileUrl).toContain('?key=test-carto-key')
    }
  })
})
