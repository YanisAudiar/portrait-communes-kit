/**
 * Contrôleur pour les opérations liées aux communes
 * Gère la logique métier des routes /geo/communes
 */

import { Request, Response } from 'express'
import { geoServerService } from '../services/geoserver'
import { databaseService } from '../services/database'
import { ValidationService } from '../services/validation'
import { logger } from '../services/logger'
import { 
  createResponse, 
  createErrorResponse, 
  createIndex,
  enrichFeaturesWithIndicators
} from '../utils/common'

class CommuneController {
  /**
   * Rechercher des communes par nom
   */
  async searchCommunes(req: Request, res: Response) {
    const searchTerm = ValidationService.validateSearchTerm(req.params.searchTerm)
    const maxResults = ValidationService.validateLimit(req.query.limit, 10, 100)
    
    logger.debug(`Recherche communes: "${searchTerm}"`)
    
    const geojsonData = await geoServerService.searchCommunes(searchTerm, maxResults)
    
    res.json({
      searchTerm,
      count: geojsonData.features.length,
      features: geojsonData.features,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Récupérer les données choroplèthe (géométries + indicateurs)
   */
  async getChoropleth(req: Request, res: Response) {
    const geoOptions = ValidationService.validateGeoOptions(req.query)

    // Récupérer les géométries (table déjà filtrée sur Rennes Métropole)
    const geojsonData = await geoServerService.getFeatures('communes', geoOptions)

    if (!geojsonData.features || geojsonData.features.length === 0) {
      return res.status(404).json(createErrorResponse(
        new Error('Aucune commune trouvée'), 
        'Récupération données choroplèthe'
      ))
    }

    // Extraire les codes INSEE des communes
    const codesInsee = geojsonData.features
      .map((feature: any) => feature.properties.code_insee_concat || feature.properties.code)
      .filter((code: any) => code)

    // Récupérer les indicateurs correspondants
    const indicateurs = await databaseService.getLatestIndicateursMenuages(codesInsee)

    // Créer un index des indicateurs par code INSEE
    const indicateursIndex = createIndex(indicateurs, 'codeInsee')

    // Enrichir les features avec les données d'indicateurs
    geojsonData.features = enrichFeaturesWithIndicators(geojsonData.features, indicateursIndex)

    const response = createResponse(geojsonData, {
      count: geojsonData.features.length,
      countWithData: geojsonData.features.filter((f: any) => f.properties.has_data).length,
      totalFeatures: geojsonData.totalFeatures || geojsonData.features.length,
      sources: {
        geometries: geoServerService.localGeojsonPath ? 'GeoJSON local' : 'GeoServer WFS',
        indicators: 'PostgreSQL - v_demo_indicateurs_menages_par_com (PGSCHEMA)'
      },
      filters: geoOptions,
      dataYear: indicateurs.length > 0 ? indicateurs[0].annee : null
    })

    res.json(response)
  }

  /**
   * Récupérer une commune spécifique par code INSEE
   */
  async getCommuneByCode(req: Request, res: Response) {
    const codeInsee = ValidationService.validateCodeInsee(req.params.codeInsee)
    
    logger.debug(`Récupération commune ${codeInsee}`)
    
    const geojsonData = await geoServerService.getCommuneByCode(codeInsee)
    
    if (!geojsonData.features || geojsonData.features.length === 0) {
      return res.status(404).json(createErrorResponse(
        new Error('Commune non trouvée'), 
        'Récupération commune'
      ))
    }

    // Enrichir la commune avec les indicateurs disponibles
    const feature = geojsonData.features[0]
    const indicateurs = await databaseService.getLatestIndicateursMenuages([codeInsee])
    const indicateursIndex = createIndex(indicateurs, 'codeInsee')
    const [enrichedFeature] = enrichFeaturesWithIndicators([feature], indicateursIndex)

    res.json(enrichedFeature || feature)
  }
}

export const communeController = new CommuneController()

