import express, { Request, Response, NextFunction } from 'express'
import { asyncHandler, createErrorResponse } from '../utils/common'
import { logger } from '../services/logger'
import { geoServerService } from '../services/geoserver'

// Import des contrôleurs
import { communeController } from '../controllers/communeController'
import { dataController } from '../controllers/dataController'

const router = express.Router()
const isDebugRouteEnabled =
  process.env.NODE_ENV !== 'production' &&
  process.env.ENABLE_DEBUG_ROUTES === 'true'
const debugRouteToken = process.env.DEBUG_ROUTE_TOKEN

// Refuser l'activation des routes debug sans token (évite une exposition accidentelle)
if (isDebugRouteEnabled && !debugRouteToken) {
  logger.warn('ENABLE_DEBUG_ROUTES=true mais DEBUG_ROUTE_TOKEN absent : routes debug désactivées')
}

// === Diagnostic GeoServer (pour déboguer les erreurs 503) ===
// SÉCURITÉ : la réponse publique se limite au statut. Le détail (URL GeoServer,
// namespace, nom de la vue interne) est de la reconnaissance offerte à un visiteur :
// il n'est renvoyé qu'hors production, ou avec un x-debug-token valide.
router.get('/geo/health', asyncHandler(async (req: Request, res: Response) => {
  const result = await geoServerService.testConnection()
  const statusCode = result.status === 'OK' ? 200 : 503

  const providedToken = req.header('x-debug-token')
  const detailsAllowed =
    process.env.NODE_ENV !== 'production' ||
    (Boolean(debugRouteToken) && providedToken === debugRouteToken)

  if (detailsAllowed) {
    return res.status(statusCode).json(result)
  }

  res.status(statusCode).json({
    status: result.status,
    timestamp: new Date().toISOString()
  })
}))

// === Routes principales ===

// Routes pour les communes (/geo/communes)
router.get('/geo/communes/search/:searchTerm', asyncHandler(communeController.searchCommunes.bind(communeController)))
router.get('/geo/communes/choropleth', asyncHandler(communeController.getChoropleth.bind(communeController)))
router.get('/geo/communes/:codeInsee', asyncHandler(communeController.getCommuneByCode.bind(communeController)))

// Routes pour les données statistiques (/data/communes)
// CES ROUTES SONT UTILISÉES PAR LA NOUVELLE APPLICATION POUR AFFICHER LES GRAPHIQUES
router.get('/data/communes/:codeInsee/demographics', asyncHandler(dataController.getDemographics.bind(dataController)))
router.get('/data/communes/:codeInsee/housing', asyncHandler(dataController.getHousing.bind(dataController)))
router.get('/data/communes/:codeInsee/economy', asyncHandler(dataController.getEconomy.bind(dataController)))
router.get('/data/communes/:codeInsee/formation', asyncHandler(dataController.getFormation.bind(dataController)))
router.get('/data/communes/:codeInsee/solidarite', asyncHandler(dataController.getSolidarite.bind(dataController)))
router.get('/data/communes/:codeInsee/agriculture', asyncHandler(dataController.getAgriculture.bind(dataController)))

// Ancienne route d'évolution (peut être utile pour des graphiques spécifiques)
router.get('/data/communes/:codeInsee/evolution', asyncHandler(dataController.getEvolution.bind(dataController)))

// Route de diagnostic Formation (bypass cache, pour déboguer les données à 0)
// SÉCURITÉ : activable uniquement avec ENABLE_DEBUG_ROUTES=true + DEBUG_ROUTE_TOKEN obligatoire
if (isDebugRouteEnabled && debugRouteToken) {
  router.get('/debug/formation/:codeInsee', (req: Request, res: Response, next: NextFunction) => {
    const providedToken = req.header('x-debug-token')
    if (providedToken !== debugRouteToken) {
      return res.status(403).json(createErrorResponse(new Error('Accès debug interdit'), 'Route debug sécurisée'))
    }

    return next()
  }, asyncHandler(dataController.getFormationDebug.bind(dataController)))
}

// Middleware de gestion d'erreur global
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  // Déterminer le code de statut approprié
  let statusCode = error.statusCode || 500
  
  // Gestion spécifique des erreurs GeoServer
  if (error.code === 'GEOSERVER_TIMEOUT') {
    statusCode = 504 // Gateway Timeout
    logger.warn('Timeout GeoServer', {
      path: req.path,
      method: req.method,
      query: req.query
    })
  } else if (error.code === 'GEOSERVER_NETWORK_ERROR') {
    statusCode = 503 // Service Unavailable
    logger.error('Erreur réseau GeoServer (503)', error, {
      path: req.path,
      method: req.method,
      message: error.message,
      originalMessage: error.originalMessage
    })
  } else {
    // Log l'erreur avec le logger structuré pour les autres erreurs
    logger.error('Erreur globale', error, {
      path: req.path,
      method: req.method,
      query: req.query,
      params: req.params
    })
    
    // Déterminer le code de statut pour les autres erreurs
    if (error.message?.includes('invalide') || error.message?.includes('incorrect')) {
      statusCode = 400 // Bad Request
    } else if (error.message?.includes('non trouvée') || error.message?.includes('trouvé')) {
      statusCode = 404 // Not Found
    }
  }

  // Réponse d'erreur structurée
  res.status(statusCode).json(createErrorResponse(error, 'Erreur serveur'))
})

export default router

