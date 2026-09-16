/**
 * Service de cache unifié pour l'application
 * Remplace les multiples systèmes de cache dans database.js et geoserver.js
 */

export interface CacheItem {
  data: any
  expiry: number
  created: number
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  clears: number
  evictions: number
}

/** Nombre maximum d'entrées conservées (protection mémoire) */
export const DEFAULT_MAX_ENTRIES = 500

export class CacheService {
  cache: Map<string, CacheItem>
  defaultTimeout: number
  /** Plafond d'entrées : au-delà, éviction LRU (voir evictIfNeeded) */
  maxEntries: number
  stats: CacheStats

  constructor(defaultTimeout: number | null = null, maxEntries: number | null = null) {
    this.cache = new Map()
    // Timeout configurable via variable d'environnement
    this.defaultTimeout = defaultTimeout || parseInt(process.env.CACHE_TIMEOUT || '') || 5 * 60 * 1000 // 5 minutes par défaut
    // SÉCURITÉ : sans plafond, un cache dont les clés dérivent d'entrées utilisateur
    // croît sans limite jusqu'à épuiser la mémoire du processus.
    this.maxEntries = maxEntries || parseInt(process.env.CACHE_MAX_ENTRIES || '') || DEFAULT_MAX_ENTRIES
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      clears: 0,
      evictions: 0
    }
  }

  /**
   * Récupérer une valeur du cache
   */
  get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }

    // Vérifier l'expiration
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // LRU : réinsérer pour marquer l'entrée comme récemment utilisée.
    // On réutilise l'objet item tel quel : l'expiration n'est pas repoussée.
    this.cache.delete(key)
    this.cache.set(key, item)

    this.stats.hits++
    return item.data
  }

  /**
   * Stocker une valeur dans le cache
   */
  set(key: string, data: any, customTimeout: number | null = null) {
    const timeout = customTimeout || this.defaultTimeout
    const expiry = Date.now() + timeout

    // Supprimer avant réinsertion : l'ordre d'insertion de la Map sert d'ordre de récence
    this.cache.delete(key)
    this.cache.set(key, {
      data,
      expiry,
      created: Date.now()
    })

    this.stats.sets++
    this.evictIfNeeded()
  }

  /**
   * Faire respecter le plafond d'entrées : purge des expirées d'abord,
   * puis éviction des moins récemment utilisées.
   */
  evictIfNeeded(): number {
    if (this.cache.size <= this.maxEntries) {
      return 0
    }

    // Purger l'expiré avant d'évincer du valide
    this.cleanup()

    let evicted = 0
    while (this.cache.size > this.maxEntries) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey === undefined) {
        break
      }
      this.cache.delete(oldestKey)
      evicted++
    }

    this.stats.evictions += evicted
    return evicted
  }

  /**
   * Vérifier si une clé existe et est valide
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Supprimer une clé spécifique
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Vider tout le cache
   */
  clear() {
    this.cache.clear()
    this.stats.clears++
  }

  /**
   * Nettoyer les éléments expirés
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    const now = Date.now()
    const items = Array.from(this.cache.values())
    // Sérialisé une seule fois : cette mesure est coûteuse sur un cache plein
    const totalSize = JSON.stringify(Array.from(this.cache.entries())).length

    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100)
        : 0,
      stats: this.stats,
      memory: {
        totalSize,
        averageItemSize: items.length > 0
          ? Math.round(totalSize / items.length)
          : 0
      },
      expiry: {
        expired: items.filter(item => now > item.expiry).length,
        valid: items.filter(item => now <= item.expiry).length
      }
    }
  }

  /**
   * Obtenir toutes les clés du cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Méthode helper pour cache avec fonction
   * Vérifie le cache, sinon exécute la fonction et met en cache
   */
  async getOrSet(key: string, fetchFunction: () => Promise<any>, timeout: number | null = null): Promise<any> {
    // Essayer de récupérer depuis le cache
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }

    // Exécuter la fonction et mettre en cache
    try {
      const data = await fetchFunction()
      this.set(key, data, timeout)
      return data
    } catch (error) {
      // Éviter dépendance circulaire avec logger
      if (process.env.NODE_ENV !== 'production') {
        console.error(`❌ Erreur cache getOrSet pour ${key}:`, error)
      }
      throw error
    }
  }
}

// Instance globale du cache
export const globalCache = new CacheService()

// Nettoyage automatique toutes les 10 minutes
setInterval(() => {
  globalCache.cleanup()
}, 10 * 60 * 1000)

