import axios from 'axios'
import { globalCache } from './cache'
import { logger } from './logger'
import { ValidationService } from './validation'
import dotenv from 'dotenv'
import {
  loadCommunesGeojson,
  filterCommunesGeojson
} from './communesGeojson'

dotenv.config()

interface LayerConfig {
  id: string
  path: string
  name: string
  filter: boolean
  interaction: {
    click: {
      style: string
      target: string
      label: string
    }
    mouseover: {
      target: string
      label: string
    }
    geoLevelParamName: string
    geoLevelParamValue: string
    geoValueParamName: string
  }
}

interface GeoServerConfig {
  url: string
  namespace: string
  projection: string
  outputProjection: string
  layers: Record<string, LayerConfig>
}

/** Lit la config GeoServer à l'instanciation (pas de défaut vers une instance tierce). */
function loadGeoServerConfig(): GeoServerConfig {
  return {
  url: process.env.GEOSERVER_URL || '',
  namespace: process.env.GEOSERVER_NAMESPACE || '',
  projection: 'EPSG:2154', // Lambert 93 (projection native)
  outputProjection: 'EPSG:4326', // Pour les sorties GeoJSON
  layers: {
    communes: {
      id: 'communes',
      // Couche WFS des communes du territoire (code_insee_concat, lib_com, geom)
      path: process.env.GEOSERVER_COMMUNES_LAYER || 'communes',
      name: 'communes_geo',
      filter: true,
      interaction: {
        click: {
          style: 'panel',
          target: '.com',
          label: 'lib_com'
        },
        mouseover: {
          target: '#popup',
          label: 'lib_com'
        },
        geoLevelParamName: 'echelle',
        geoLevelParamValue: 'commune',
        geoValueParamName: 'territoire'
      }
    }
  }
  }
}

export interface GeoServerOptions {
  outputProjection?: string
  maxFeatures?: number
  limit?: number
  bretagne?: boolean
  territoire?: string
  echelle?: string
  code?: string
  codeInsee?: string
  epci?: string
  departement?: string
  bbox?: number[]
  timeout?: number
  precision?: string
}

export class GeoServerService {
  config: GeoServerConfig
  cache: any
  /** Chemin GeoJSON local ; si renseigné, WFS n'est pas appelé. */
  localGeojsonPath: string

  constructor() {
    this.config = loadGeoServerConfig()
    this.cache = globalCache // Utiliser le cache unifié
    this.localGeojsonPath = (process.env.COMMUNES_GEOJSON_PATH || '').trim()
  }

  /**
   * Construire les paramètres WFS selon les options
   */
  buildWFSParams(layer: LayerConfig, options: GeoServerOptions = {}) {
    const baseParams: any = {
      service: 'WFS',
      version: '1.0.0', // WFS 1.0.0 (maxFeatures)
      request: 'GetFeature',
      typeName: `${this.config.namespace}:${layer.path}`,
      outputFormat: 'application/json',
      srsName: options.outputProjection || this.config.outputProjection
    }

    // Limite de features (maxFeatures pour WFS 1.0.0)
    if (options.maxFeatures) {
      baseParams.maxFeatures = options.maxFeatures
    } else if (options.limit) {
      baseParams.maxFeatures = options.limit
    }

    // Filtre CQL pour le code INSEE si fourni
    if (options.codeInsee) {
      const validatedCodeInsee = ValidationService.validateCodeInsee(options.codeInsee)
      baseParams.CQL_FILTER = `code_insee_concat='${validatedCodeInsee}'`
    }

    return baseParams
  }

  /**
   * Construire la clé de cache d'une requête de features.
   *
   * SÉCURITÉ : ne retenir que les options qui influencent réellement la requête WFS
   * (cf. buildWFSParams). Sérialiser `options` en entier laissait des champs libres
   * non utilisés (territoire, epci, bbox, precision) entrer dans la clé : chaque valeur
   * distincte stockait une nouvelle copie de la *même* réponse, ce qui offrait un levier
   * de saturation mémoire à moindres frais pour l'appelant.
   */
  buildCacheKey(layerId: string, layer: LayerConfig, options: GeoServerOptions = {}): string {
    const requestScope = {
      codeInsee: options.codeInsee ?? null,
      maxFeatures: options.maxFeatures ?? options.limit ?? null,
      srsName: options.outputProjection || this.config.outputProjection
    }

    // Le nom de la table reste dans la clé pour éviter les conflits entre couches
    return `geoserver_${layerId}_${layer.path}_${JSON.stringify(requestScope)}`
  }

  /**
   * Récupérer des features depuis un GeoJSON local ou GeoServer WFS
   */
  async getFeatures(layerId: string, options: GeoServerOptions = {}) {
    const layer = this.config.layers[layerId]
    if (!layer) {
      throw new Error(`Couche ${layerId} non trouvée`)
    }

    if (this.localGeojsonPath) {
      return this.getFeaturesFromGeojson(layerId, options)
    }

    if (!this.config.url) {
      throw new Error('GEOSERVER_URL ou COMMUNES_GEOJSON_PATH est requis (voir backend/env.example)')
    }

    // Gestion du cache avec globalCache
    const cacheKey = this.buildCacheKey(layerId, layer, options)
    const cached = this.cache.get(cacheKey)
    
    if (cached) {
      logger.debug(`Cache hit GeoServer ${layerId}`)
      return cached
    }

    try {
      const params = this.buildWFSParams(layer, options)
      
      const response = await axios.get(this.config.url, {
        params,
        timeout: options.timeout || 30000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portrait-Communes/1.0'
        }
      })

      const geojsonData = response.data

      if (!geojsonData.features) {
        throw new Error('Réponse GeoServer invalide')
      }

      // Normaliser les propriétés selon la couche
      if (layerId === 'communes') {
        geojsonData.features = geojsonData.features.map((feature: any) => ({
          ...feature,
          properties: this.normalizeProperties(feature.properties, layerId)
        }))
      }

      // Mettre en cache avec globalCache (timeout configuré dans cache.js)
      this.cache.set(cacheKey, geojsonData)

      logger.debug(`${geojsonData.features.length} features GeoServer ${layerId}`)
      
      return geojsonData

    } catch (error: any) {
      logger.error(`Erreur GeoServer ${layerId}`, error)
      throw this.handleGeoServerError(error)
    }
  }

  /**
   * Communes depuis un fichier GeoJSON (démo / agence sans GeoServer).
   */
  private getFeaturesFromGeojson(layerId: string, options: GeoServerOptions) {
    const raw = loadCommunesGeojson(this.localGeojsonPath)
    const geojsonData = filterCommunesGeojson(raw, {
      codeInsee: options.codeInsee
        ? ValidationService.validateCodeInsee(options.codeInsee)
        : undefined,
      maxFeatures: options.maxFeatures,
      limit: options.limit
    })
    if (layerId === 'communes') {
      geojsonData.features = geojsonData.features.map((feature) => ({
        ...feature,
        properties: this.normalizeProperties(feature.properties, layerId)
      }))
    }
    logger.debug(`${geojsonData.features.length} features GeoJSON local ${layerId}`)
    return geojsonData
  }

  /**
   * Normaliser les propriétés selon le type de couche
   * Propriétés minimales : id_com, code_insee_concat, lib_com, geom
   */
  normalizeProperties(properties: any, layerId: string) {
    switch (layerId) {
      case 'communes':
        return {
          code: properties.code_insee_concat, // Code INSEE
          nom: properties.lib_com, // Nom de la commune
          id_com: properties.id_com, // ID commune
          // Garder toutes les propriétés originales
          ...properties
        }
      default:
        return properties
    }
  }

  /**
   * Gérer les erreurs GeoServer
   * Codes réseau : ECONNREFUSED, ENOTFOUND, ETIMEDOUT, ECONNABORTED, ENETUNREACH
   */
  handleGeoServerError(error: any) {
    // Gestion spécifique des timeouts
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      const timeoutError: any = new Error(`Timeout de connexion au GeoServer (${this.config.url})`)
      timeoutError.code = 'GEOSERVER_TIMEOUT'
      timeoutError.statusCode = 504 // Gateway Timeout
      return timeoutError
    }

    // Gestion des erreurs de connexion réseau (503 Service Unavailable)
    const networkErrorCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN']
    if (networkErrorCodes.includes(error.code)) {
      const networkError: any = new Error(
        `Impossible de se connecter au GeoServer (${error.code}): ${this.config.url}`
      )
      networkError.code = 'GEOSERVER_NETWORK_ERROR'
      networkError.statusCode = 503 // Service Unavailable
      networkError.originalMessage = error.message
      return networkError
    }
    
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message
      
      switch (status) {
        case 400:
          return new Error(`Requête invalide: ${message}`)
        case 404:
          return new Error('Couche non trouvée sur le GeoServer')
        case 500:
          return new Error('Erreur interne du GeoServer')
        default:
          return new Error(`Erreur GeoServer (${status}): ${message}`)
      }
    }
    
    return error
  }

  /**
   * Tester la connexion GeoServer (diagnostic pour erreurs 503)
   */
  async testConnection() {
    if (this.localGeojsonPath) {
      try {
        const data = loadCommunesGeojson(this.localGeojsonPath)
        return {
          status: 'OK',
          source: 'geojson',
          path: this.localGeojsonPath,
          count: data.features.length,
          message: 'Communes chargées depuis un GeoJSON local'
        }
      } catch (error: any) {
        return {
          status: 'ERROR',
          source: 'geojson',
          path: this.localGeojsonPath,
          error: error.message,
          message: 'Fichier GeoJSON illisible — vérifier COMMUNES_GEOJSON_PATH'
        }
      }
    }

    const layer = this.config.layers.communes
    const layerPath = layer?.path || 'non défini'

    try {
      const response = await axios.get(this.config.url, {
        params: {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetCapabilities'
        },
        timeout: 10000
      })

      return {
        status: 'OK',
        url: this.config.url,
        namespace: this.config.namespace,
        layer: layerPath,
        responseStatus: response.status,
        message: 'Connexion GeoServer fonctionnelle'
      }
    } catch (error: any) {
      return {
        status: 'ERROR',
        url: this.config.url,
        namespace: this.config.namespace,
        layer: layerPath,
        errorCode: error.code,
        error: error.message,
        message: 'Connexion GeoServer échouée - vérifier GEOSERVER_URL et accès réseau'
      }
    }
  }

  /**
   * Récupérer les capacités du service
   */
  async getCapabilities() {
    try {
      const response = await axios.get(this.config.url, {
        params: {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetCapabilities'
        },
        timeout: 10000
      })

      return response.data
    } catch (error: any) {
      throw this.handleGeoServerError(error)
    }
  }

  /**
   * Vider le cache GeoServer
   */
  clearCache() {
    // Supprimer uniquement les clés GeoServer du cache global
    const keys = this.cache.keys()
    const geoserverKeys = keys.filter((key: string) => key.startsWith('geoserver_'))
    geoserverKeys.forEach((key: string) => this.cache.delete(key))
    logger.cache(`Cache GeoServer vidé: ${geoserverKeys.length} éléments`)
  }

  /**
   * Statistiques du cache GeoServer
   */
  getCacheStats() {
    const allKeys = this.cache.keys()
    const geoserverKeys = allKeys.filter((key: string) => key.startsWith('geoserver_'))
    return {
      size: geoserverKeys.length,
      keys: geoserverKeys,
      globalCacheStats: this.cache.getStats()
    }
  }

  /**
   * Récupérer une commune spécifique par code INSEE
   */
  async getCommuneByCode(codeInsee: string) {
    return this.getFeatures('communes', {
      codeInsee,
      maxFeatures: 1,
      precision: 'high'
    })
  }

  /**
   * Rechercher des communes par nom
   * On récupère un lot de communes du territoire puis on filtre par nom,
   * sinon une recherche peut échouer si la commune n'est pas dans les N premiers.
   */
  async searchCommunes(searchTerm: string, maxResults: number = 10) {
    const FETCH_SIZE = 500
    return this.getFeatures('communes', {
      maxFeatures: FETCH_SIZE,
      precision: 'medium'
    }).then(geojson => {
      const term = searchTerm.trim().toLowerCase()
      const filtered = geojson.features.filter((feature: any) =>
        feature.properties.nom?.toLowerCase().includes(term)
      )
      return {
        ...geojson,
        features: filtered.slice(0, maxResults)
      }
    })
  }
}

// Instance singleton
export const geoServerService = new GeoServerService()

