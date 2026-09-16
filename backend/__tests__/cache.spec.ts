import { describe, it, expect, beforeEach } from 'vitest'
import { globalCache, CacheService, DEFAULT_MAX_ENTRIES } from '../services/cache'

describe('Cache Service - Global Cache Tests', () => {
  beforeEach(() => {
    globalCache.clear()
  })

  describe('Basic Cache Operations', () => {
    it('should store and retrieve data', () => {
      const data = { test: 'value' }
      
      globalCache.set('test-key', data)
      const retrieved = globalCache.get('test-key')
      
      expect(retrieved).toEqual(data)
    })

    it('should return null for non-existent keys', () => {
      const result = globalCache.get('non-existent')
      
      expect(result).toBeNull()
    })

    it('should delete keys', () => {
      globalCache.set('test-key', { data: 'value' })
      
      globalCache.delete('test-key')
      
      expect(globalCache.get('test-key')).toBeNull()
    })

    it('should clear all keys', () => {
      globalCache.set('key1', 'value1')
      globalCache.set('key2', 'value2')
      
      globalCache.clear()
      
      expect(globalCache.get('key1')).toBeNull()
      expect(globalCache.get('key2')).toBeNull()
    })
  })

  describe('TTL - Time To Live', () => {
    it('should expire data after TTL', async () => {
      globalCache.set('short-lived', { data: 'value' }, 100) // 100ms TTL
      
      expect(globalCache.get('short-lived')).toBeDefined()
      
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(globalCache.get('short-lived')).toBeNull()
    })

    it('should keep data within TTL', async () => {
      globalCache.set('long-lived', { data: 'value' }, 500) // 500ms TTL
      
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(globalCache.get('long-lived')).toBeDefined()
    })
  })

  describe('Cache Statistics', () => {
    it('should track hits and misses', () => {
      globalCache.set('cached-key', 'value')
      
      globalCache.get('cached-key') // Hit
      globalCache.get('missing-key') // Miss
      
      const stats = globalCache.getStats()
      
      expect(stats.stats.hits).toBeGreaterThan(0)
      expect(stats.stats.misses).toBeGreaterThan(0)
    })
  })

  describe('Cache Keys Management', () => {
    it('should list all keys', () => {
      globalCache.set('key1', 'value1')
      globalCache.set('key2', 'value2')
      
      const keys = globalCache.keys()
      
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
    })

    it('should filter keys by prefix', () => {
      globalCache.set('geoserver_communes', { data: 1 })
      globalCache.set('geoserver_regions', { data: 2 })
      globalCache.set('api_communes', { data: 3 })
      
      const keys = globalCache.keys()
      const geoserverKeys = keys.filter((k: string) => k.startsWith('geoserver_'))
      
      expect(geoserverKeys).toHaveLength(2)
    })
  })

  describe('Cache Isolation - Different Requests', () => {
    it('should not mix cached data between commune codes', () => {
      globalCache.set('commune_35208', { nom: 'Orgères' })
      globalCache.set('commune_35238', { nom: 'Rennes' })
      
      expect(globalCache.get('commune_35208')).toEqual({ nom: 'Orgères' })
      expect(globalCache.get('commune_35238')).toEqual({ nom: 'Rennes' })
    })

    it('should cache GeoServer results per query params', () => {
      const params1 = { codeInsee: '35208' }
      const params2 = { codeInsee: '35238' }
      
      const key1 = `geoserver_communes_${JSON.stringify(params1)}`
      const key2 = `geoserver_communes_${JSON.stringify(params2)}`
      
      globalCache.set(key1, { features: ['Orgères'] })
      globalCache.set(key2, { features: ['Rennes'] })
      
      expect(globalCache.get(key1)).not.toEqual(globalCache.get(key2))
    })
  })
})

describe('Cache Service - Plafond memoire et eviction LRU', () => {
  it('should never exceed maxEntries', () => {
    const cache = new CacheService(60000, 5)

    for (let i = 0; i < 50; i++) {
      cache.set(`cle-${i}`, { data: i })
    }

    expect(cache.cache.size).toBe(5)
    expect(cache.getStats().stats.evictions).toBeGreaterThan(0)
  })

  it('should evict the least recently used entry first', () => {
    const cache = new CacheService(60000, 3)

    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)

    // 'a' redevient la plus recemment utilisee
    expect(cache.get('a')).toBe(1)

    // L'insertion de 'd' doit evincer 'b' (la plus ancienne en usage), pas 'a'
    cache.set('d', 4)

    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBeNull()
    expect(cache.get('c')).toBe(3)
    expect(cache.get('d')).toBe(4)
  })

  it('should not extend expiry when refreshing recency on read', async () => {
    const cache = new CacheService(60000, 10)
    cache.set('court', 'valeur', 120)

    await new Promise(resolve => setTimeout(resolve, 60))
    expect(cache.get('court')).toBe('valeur')

    await new Promise(resolve => setTimeout(resolve, 100))
    // Si la lecture avait repousse l'expiration, l'entree serait encore la
    expect(cache.get('court')).toBeNull()
  })

  it('should drop expired entries before evicting valid ones', () => {
    const cache = new CacheService(60000, 3)

    cache.set('expire-1', 1, -1)
    cache.set('expire-2', 2, -1)
    cache.set('valide-1', 3)
    cache.set('valide-2', 4)

    expect(cache.cache.size).toBeLessThanOrEqual(3)
    expect(cache.get('valide-1')).toBe(3)
    expect(cache.get('valide-2')).toBe(4)
  })

  it('should default to DEFAULT_MAX_ENTRIES', () => {
    expect(new CacheService().maxEntries).toBe(DEFAULT_MAX_ENTRIES)
  })
})
