import type { Map } from 'maplibre-gl'

// Configuration de l'API depuis les variables d'environnement
// En production, utiliser une URL relative car le frontend est servi par le même serveur
// En développement, utiliser localhost ou la variable d'environnement
const getApiBase = (): string => {
  // Si une variable d'environnement est définie, l'utiliser
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // En production (mode build), utiliser une URL relative
  if (import.meta.env.PROD) {
    return '/api'
  }
  
  // En développement, utiliser localhost (IP explicite pour éviter problèmes Node/IPv6)
  return 'http://127.0.0.1:5000/api'
}

const API_BASE = getApiBase()

/**
 * Construire une URL avec paramètres de requête
 */
const buildUrl = (endpoint: string, params: Record<string, any> = {}): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','))
      } else {
        searchParams.append(key, value.toString())
      }
    }
  })
  
  const queryString = searchParams.toString()
  return `${API_BASE}${endpoint}${queryString ? '?' + queryString : ''}`
}

/**
 * Effectuer une requête HTTP avec gestion d'erreur
 */
const fetchWithErrorHandling = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    throw error
  }
}

export interface GeoParamsOptions {
  territoire?: string
  echelle?: string
  code?: string
  departement?: string
  limit?: number
  bbox?: string
  bretagne?: boolean
  [key: string]: any
}

const CODE_INSEE_REGEX = /^([0-9]{5}|2[AB][0-9]{3})$/
const SEARCH_TERM_REGEX = /^[a-zA-ZÀ-ÿ0-9\s\-']+$/

const normalizeAndValidateCodeInsee = (codeInsee: string): string => {
  const normalized = codeInsee.trim().toUpperCase()
  if (!CODE_INSEE_REGEX.test(normalized)) {
    throw new Error('Code INSEE invalide')
  }
  return normalized
}

const normalizeAndValidateSearchTerm = (searchTerm: string): string => {
  const normalized = searchTerm.trim()
  if (normalized.length < 2) {
    throw new Error('Terme de recherche trop court (minimum 2 caractères)')
  }
  if (normalized.length > 100) {
    throw new Error('Terme de recherche trop long (maximum 100 caractères)')
  }
  if (!SEARCH_TERM_REGEX.test(normalized)) {
    throw new Error('Terme de recherche contient des caractères non autorisés')
  }
  return normalized
}

/**
 * Construire les paramètres géographiques communs
 */
const buildGeoParams = (options: GeoParamsOptions): GeoParamsOptions => ({
  territoire: options.territoire,
  echelle: options.echelle,
  code: options.code,
  departement: options.departement,
  limit: options.limit,
  bbox: options.bbox,
  bretagne: options.bretagne
})

export const api = {
  // === Routes principales ===
  
  // Données choroplèthe (géométries + indicateurs) - Route principale
  getCommunesChoropleth: (options: GeoParamsOptions = {}) =>
    fetchWithErrorHandling(buildUrl('/geo/communes/choropleth', buildGeoParams(options))),

  // Commune spécifique par code INSEE
  getCommuneByCode: (codeInsee: string) =>
    fetchWithErrorHandling(buildUrl(`/geo/communes/${normalizeAndValidateCodeInsee(codeInsee)}`)),

  // === Données Thématiques ===

  // Données démographiques
  getCommuneDemographics: (codeInsee: string) =>
    fetchWithErrorHandling(buildUrl(`/data/communes/${normalizeAndValidateCodeInsee(codeInsee)}/demographics`)),

  // Données habitat
  getCommuneHousing: (codeInsee: string) =>
    fetchWithErrorHandling(buildUrl(`/data/communes/${normalizeAndValidateCodeInsee(codeInsee)}/housing`)),

  // Données économie (inclut emploi)
  getCommuneEconomy: (codeInsee: string) =>
    fetchWithErrorHandling(buildUrl(`/data/communes/${normalizeAndValidateCodeInsee(codeInsee)}/economy`)),

  // Données formation (enseignement)
  getCommuneFormation: (codeInsee: string) =>
    fetchWithErrorHandling(buildUrl(`/data/communes/${normalizeAndValidateCodeInsee(codeInsee)}/formation`)),

  // Données solidarité
  getCommuneSolidarite: (codeInsee: string) =>
    fetchWithErrorHandling(buildUrl(`/data/communes/${normalizeAndValidateCodeInsee(codeInsee)}/solidarite`)),

  // Données agriculture
  getCommuneAgriculture: (codeInsee: string) =>
    fetchWithErrorHandling(buildUrl(`/data/communes/${normalizeAndValidateCodeInsee(codeInsee)}/agriculture`)),

  // Évolution temporelle d'une commune (ancienne route, gardée pour compatibilité éventuelle)
  getCommuneEvolution: (codeInsee: string, indicator: string = 'nb_menages') =>
    fetchWithErrorHandling(buildUrl(`/data/communes/${normalizeAndValidateCodeInsee(codeInsee)}/evolution`, { indicator })),

  // Recherche de communes
  searchCommunes: (searchTerm: string, limit: number = 10) =>
    fetchWithErrorHandling(
      buildUrl(
        `/geo/communes/search/${encodeURIComponent(normalizeAndValidateSearchTerm(searchTerm))}`,
        { limit }
      )
    ),

  // === Utilitaires ===
  
  // Construire une bbox à partir des limites visibles de la carte
  buildBbox: (map: Map | null): number[] | null => {
    if (!map) return null
    
    const bounds = map.getBounds()
    return [
      bounds.getWest(),
      bounds.getSouth(), 
      bounds.getEast(),
      bounds.getNorth()
    ]
  },

  // Gestion d'erreurs centralisée
  handleError: (error: any): string => {
    console.error('API Error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Erreur de connexion au serveur'
      }
      
      if (error.message.includes('404')) {
        return 'Données non trouvées'
      }
      
      if (error.message.includes('500')) {
        return 'Erreur interne du serveur'
      }
      return error.message
    }
    
    return typeof error === 'string' ? error : 'Erreur inconnue'
  },

  // === COMPARAISON TERRITORIALE ===
  
  /**
   * Récupère les données d'une commune selon le thème spécifié
   * Utilisé pour la fonctionnalité de comparaison sur les graphiques
   * @param codeInsee - Code INSEE de la commune
   * @param theme - Thème de données (demographics, housing, economy, formation, solidarite, agriculture)
   */
  getCommuneDataByTheme: (codeInsee: string, theme: string) => {
    const validatedCodeInsee = normalizeAndValidateCodeInsee(codeInsee)
    const themeEndpoints: Record<string, string> = {
      demographics: `/data/communes/${validatedCodeInsee}/demographics`,
      demographie: `/data/communes/${validatedCodeInsee}/demographics`,
      housing: `/data/communes/${validatedCodeInsee}/housing`,
      habitat: `/data/communes/${validatedCodeInsee}/housing`,
      economy: `/data/communes/${validatedCodeInsee}/economy`,
      economie: `/data/communes/${validatedCodeInsee}/economy`,
      emploi: `/data/communes/${validatedCodeInsee}/economy`,
      formation: `/data/communes/${validatedCodeInsee}/formation`,
      enseignement: `/data/communes/${validatedCodeInsee}/formation`,
      solidarite: `/data/communes/${validatedCodeInsee}/solidarite`,
      agriculture: `/data/communes/${validatedCodeInsee}/agriculture`
    }
    
    const endpoint = themeEndpoints[theme.toLowerCase()]
    if (!endpoint) {
      console.warn(`⚠️ Thème inconnu: ${theme}. Thèmes valides: ${Object.keys(themeEndpoints).join(', ')}`)
      return Promise.reject(new Error(`Thème inconnu: ${theme}`))
    }
    
    return fetchWithErrorHandling(buildUrl(endpoint))
  }
}
