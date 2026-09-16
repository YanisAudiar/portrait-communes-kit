/**
 * Utilitaires communs pour l'application
 */

import { Request, Response, NextFunction } from 'express'

const isProduction = (): boolean => process.env.NODE_ENV === 'production'

/**
 * Créer une réponse standardisée avec métadonnées
 */
export const createResponse = (data: any, metadata: object = {}) => {
  return {
    ...data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  }
}

/**
 * Créer une réponse d'erreur standardisée
 * En production : message générique, pas de détails internes
 */
export const createErrorResponse = (error: Error | string, context: string = '') => {
  const errorMessage = error instanceof Error ? error.message : error

  if (!isProduction()) {
    console.error(`❌ ${context}:`, errorMessage)
  }

  return {
    error: context || 'Erreur',
    message: isProduction()
      ? 'Une erreur interne est survenue.'
      : errorMessage,
    ...(isProduction() ? {} : { details: errorMessage }),
    timestamp: new Date().toISOString()
  }
}

/**
 * Retire les champs internes de debug avant envoi au client en production
 */
export const sanitizeClientPayload = <T extends Record<string, unknown>>(data: T): T => {
  if (!isProduction() || !data || typeof data !== 'object') {
    return data
  }

  const { _queryErrors, ...safeData } = data
  return safeData as T
}

/**
 * Middleware de gestion d'erreur pour les routes async
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * Valider les données numériques et les convertir
 */
export const ensureNumeric = (value: any, defaultValue: number = 0): number => {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Créer un index à partir d'un tableau d'objets
 */
export const createIndex = (array: any[], keyField: string): Record<string, any> => {
  const index: Record<string, any> = {}
  array.forEach(item => {
    const key = item[keyField]
    if (key) {
      index[key] = item
    }
  })
  return index
}

/**
 * Enrichir les features GeoJSON avec des données d'indicateurs
 */
export const enrichFeaturesWithIndicators = (features: any[], indicateursIndex: Record<string, any>): any[] => {
  return features.map(feature => {
    const codeInsee = feature.properties.code_insee_concat || feature.properties.code
    const indicateur = indicateursIndex[codeInsee]
    
    if (indicateur) {
      feature.properties = {
        ...feature.properties,
        // Données d'indicateurs (s'assurer qu'elles sont numériques)
        nb_menages: ensureNumeric(indicateur.nbMenages),
        part_personnes_seules: ensureNumeric(indicateur.partPersonnesSeules),
        taille_moyenne_menage: ensureNumeric(indicateur.tailleMoyenneMenage),
        annee_donnees: ensureNumeric(indicateur.annee),
        has_data: true
      }
    } else {
      feature.properties = {
        ...feature.properties,
        nb_menages: 0,
        part_personnes_seules: 0,
        taille_moyenne_menage: 0,
        annee_donnees: 0,
        has_data: false
      }
    }
    
    return feature
  })
}
