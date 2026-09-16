/**
 * Service de validation centralisé pour toutes les entrées utilisateur
 * Utilise des validateurs personnalisés pour garantir la sécurité
 */

import { Request, Response, NextFunction } from 'express'

export class ValidationService {
  /** Nombre maximum de communes pour un PDF comparatif (protection DoS) */
  static readonly MAX_COMPARATIVE_COMMUNES = 5

  /**
   * Valider un code INSEE (5 chiffres ou 5 chiffres + lettre pour communes spéciales)
   */
  static validateCodeInsee(codeInsee: any): string {
    if (!codeInsee || typeof codeInsee !== 'string') {
      throw new Error('Code INSEE invalide : doit être une chaîne de caractères')
    }

    // Normaliser avant validation pour éviter les faux négatifs
    const normalized = codeInsee.trim().toUpperCase()

    // Format : 5 chiffres ou 2A/2B suivi de 3 chiffres (Corse)
    const codeInseeRegex = /^([0-9]{5}|2[AB][0-9]{3})$/

    if (!codeInseeRegex.test(normalized)) {
      throw new Error('Code INSEE invalide : format incorrect (attendu: 5 chiffres ou 2A/2B + 3 chiffres)')
    }

    return normalized
  }

  /**
   * Valider un code département
   */
  static validateDepartement(departement: any): string {
    if (!departement) {
      return 'all' // Valeur par défaut
    }

    if (typeof departement !== 'string') {
      throw new Error('Code département invalide : doit être une chaîne de caractères')
    }

    const validDepartements = ['all', '22', '29', '35', '56']
    
    if (!validDepartements.includes(departement)) {
      throw new Error(`Code département invalide : doit être l'un de ${validDepartements.join(', ')}`)
    }

    return departement
  }

  /**
   * Valider un nom d'indicateur
   */
  static validateIndicator(indicator: any): string {
    if (!indicator) {
      return 'nb_menages' // Valeur par défaut
    }

    if (typeof indicator !== 'string') {
      throw new Error('Indicateur invalide : doit être une chaîne de caractères')
    }

    const validIndicators = [
      'nb_menages',
      'taille_moyenne_menage',
      'part_personnes_seules',
      'part_couples',
      'part_familles_monoparentales',
      'population',
      'nb_logements'
    ]

    if (!validIndicators.includes(indicator)) {
      throw new Error(`Indicateur invalide : doit être l'un de ${validIndicators.join(', ')}`)
    }

    return indicator
  }

  /**
   * Valider un ID de thématique (pour les routes PDF)
   */
  static validateThemeId(themeId: any): string {
    if (!themeId || typeof themeId !== 'string') {
      return 'all' // Valeur par défaut
    }

    const validThemeIds = [
      'demographie',
      'habitat',
      'enseignement',
      'economie-emploi',
      'solidarite',
      'energie-environnement',
      'mobilites',
      'agriculture',
      'equipement-services',
      'all'
    ]

    const normalized = themeId.trim().toLowerCase()
    if (!validThemeIds.includes(normalized)) {
      throw new Error(`Thématique invalide : doit être l'une de ${validThemeIds.join(', ')}`)
    }

    return normalized
  }

  /**
   * Valider le tableau de codes INSEE pour un PDF comparatif
   */
  static validateComparativeCodeInsees(codeInsees: any): string[] {
    if (!codeInsees || !Array.isArray(codeInsees) || codeInsees.length === 0) {
      throw new Error('Le tableau codeInsees est requis et doit contenir au moins une commune')
    }

    if (codeInsees.length > this.MAX_COMPARATIVE_COMMUNES) {
      throw new Error(`Maximum ${this.MAX_COMPARATIVE_COMMUNES} communes autorisées pour un PDF comparatif`)
    }

    return codeInsees.map((code) => this.validateCodeInsee(code))
  }

  /**
   * Valider un terme de recherche
   */
  static validateSearchTerm(searchTerm: any): string {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new Error('Terme de recherche invalide : doit être une chaîne de caractères')
    }

    // Nettoyer le terme de recherche
    const cleaned = searchTerm.trim()

    if (cleaned.length < 2) {
      throw new Error('Terme de recherche trop court : minimum 2 caractères')
    }

    if (cleaned.length > 100) {
      throw new Error('Terme de recherche trop long : maximum 100 caractères')
    }

    // Échapper les caractères spéciaux pour SQL
    // Autoriser uniquement lettres, chiffres, espaces, tirets et apostrophes
    const safePattern = /^[a-zA-ZÀ-ÿ0-9\s\-']+$/
    
    if (!safePattern.test(cleaned)) {
      throw new Error('Terme de recherche contient des caractères non autorisés')
    }

    return cleaned
  }

  /**
   * Valider une limite de résultats
   */
  static validateLimit(limit: any, defaultValue: number = 10, maxValue: number = 1000): number {
    if (!limit) {
      return defaultValue
    }

    const parsedLimit = parseInt(limit, 10)

    if (isNaN(parsedLimit)) {
      throw new Error('Limite invalide : doit être un nombre')
    }

    if (parsedLimit < 1) {
      throw new Error('Limite invalide : doit être supérieure à 0')
    }

    if (parsedLimit > maxValue) {
      throw new Error(`Limite invalide : maximum ${maxValue}`)
    }

    return parsedLimit
  }

  /**
   * Valider une année
   */
  static validateYear(year: any): number | null {
    if (!year) {
      return null // Année optionnelle
    }

    const parsedYear = parseInt(year, 10)

    if (isNaN(parsedYear)) {
      throw new Error('Année invalide : doit être un nombre')
    }

    const currentYear = new Date().getFullYear()
    const minYear = 1990

    if (parsedYear < minYear || parsedYear > currentYear) {
      throw new Error(`Année invalide : doit être entre ${minYear} et ${currentYear}`)
    }

    return parsedYear
  }

  /**
   * Valider une bbox (bounding box)
   */
  static validateBbox(bbox: any): number[] | null {
    if (!bbox) {
      return null // Bbox optionnelle
    }

    let bboxArray: number[]

    // Si c'est une chaîne, la convertir en tableau
    if (typeof bbox === 'string') {
      bboxArray = bbox.split(',').map(v => parseFloat(v.trim()))
    } else if (Array.isArray(bbox)) {
      bboxArray = bbox.map(v => parseFloat(v))
    } else {
      throw new Error('Bbox invalide : format incorrect')
    }

    // Une bbox doit avoir 4 valeurs : [minLon, minLat, maxLon, maxLat]
    if (bboxArray.length !== 4) {
      throw new Error('Bbox invalide : doit contenir 4 valeurs [minLon, minLat, maxLon, maxLat]')
    }

    // Vérifier que toutes les valeurs sont des nombres valides
    if (bboxArray.some(v => isNaN(v))) {
      throw new Error('Bbox invalide : toutes les valeurs doivent être des nombres')
    }

    const [minLon, minLat, maxLon, maxLat] = bboxArray

    // Vérifier les limites géographiques
    if (minLon < -180 || minLon > 180 || maxLon < -180 || maxLon > 180) {
      throw new Error('Bbox invalide : longitude doit être entre -180 et 180')
    }

    if (minLat < -90 || minLat > 90 || maxLat < -90 || maxLat > 90) {
      throw new Error('Bbox invalide : latitude doit être entre -90 et 90')
    }

    // Vérifier la cohérence
    if (minLon >= maxLon) {
      throw new Error('Bbox invalide : minLon doit être inférieur à maxLon')
    }

    if (minLat >= maxLat) {
      throw new Error('Bbox invalide : minLat doit être inférieur à maxLat')
    }

    return bboxArray
  }

  /**
   * Valider les options de géométrie
   */
  static validateGeoOptions(query: any): any {
    const validated: any = {}

    try {
      if (query.territoire) {
        validated.territoire = this.validateSearchTerm(query.territoire)
      }

      if (query.echelle) {
        const validEchelles = ['commune', 'epci', 'departement', 'region']
        if (!validEchelles.includes(query.echelle)) {
          throw new Error(`Échelle invalide : doit être l'un de ${validEchelles.join(', ')}`)
        }
        validated.echelle = query.echelle
      }

      if (query.code) {
        validated.code = this.validateCodeInsee(query.code)
      }

      if (query.departement) {
        validated.departement = this.validateDepartement(query.departement)
      }

      if (query.epci) {
        // Valider le nom de l'EPCI (permet lettres, chiffres, espaces, tirets et apostrophes)
        validated.epci = this.validateSearchTerm(query.epci)
      }

      if (query.limit) {
        validated.limit = this.validateLimit(query.limit)
      }

      if (query.bbox) {
        validated.bbox = this.validateBbox(query.bbox)
      }

      if (query.bretagne !== undefined) {
        validated.bretagne = query.bretagne === 'true' || query.bretagne === true
      }

      return validated

    } catch (error) {
      throw error
    }
  }

  /**
   * Middleware de validation pour Express
   */
  static validationMiddleware(validatorFn: (req: Request) => void) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        validatorFn(req)
        next()
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: error.message,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        })
      }
    }
  }
}

