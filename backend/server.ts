import express, { Request, Response, NextFunction } from 'express'
import compression from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs'

import { isOriginAllowed } from './utils/corsConfig'
import { arePdfRoutesEnabled } from './utils/featureFlags'
import { buildCspDirectives } from './utils/cspConfig'

dotenv.config()

// Charger le logger
import { logger } from './services/logger'

const app = express()
const PORT = process.env.PORT || 5000

// Trust proxy : requis derrière reverse proxy (Apache, nginx) pour rate-limit par IP réelle
// Configurable via TRUST_PROXY (défaut: 1 hop). Mettre 0 si pas de proxy de confiance.
const trustProxy = process.env.TRUST_PROXY !== undefined
  ? Number(process.env.TRUST_PROXY)
  : 1
app.set('trust proxy', trustProxy)

// Rate limiting : protection contre abus et DoS
// 100 requêtes / 15 min par IP pour l'API générale
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 100,
  message: { error: 'Trop de requêtes, réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiting plus strict pour la génération PDF (coûteuse en ressources)
const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Limite de génération PDF atteinte, réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false
})

// Configuration CORS sécurisée
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      logger.warn(`CORS bloqué pour origine: ${origin}`)
      callback(new Error('Origine non autorisée par CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}

// Content Security Policy servie en EN-TÊTE (plus en <meta> dans index.html).
// En balise <meta>, frame-ancestors est ignoré par les navigateurs et la politique
// ne couvre pas les réponses de l'API : l'en-tête corrige les deux.
//
// Choix explicites :
//  - script-src SANS 'unsafe-inline' ni 'unsafe-eval'. Matomo se charge depuis
//    le bundle (matomoInit.ts) si configuré ; aucun eval / new Function dans
//    le bundle livré (Chart.js et MapLibre n'en ont pas besoin).
//  - blob: reste autorisé pour worker-src (workers MapLibre) mais PAS pour
//    script-src : un blob: exécutable est un contournement connu de CSP.
//  - style-src conserve 'unsafe-inline' : Vue injecte ses styles scopés à l'exécution
//    et des attributs style sont utilisés. Sans nonce par requête, on ne peut pas
//    l'éviter sur des fichiers statiques.
//  - connect-src : origine de GEOSERVER_URL + CSP_CONNECT_SRC (Matomo, etc.).
const cspDirectives: Record<string, string[]> = buildCspDirectives(process.env)

// CSP_REPORT_ONLY=true : la politique est signalée sans bloquer. À utiliser pour une
// première validation en pré-prod (console navigateur), puis repasser en mode bloquant.
const cspReportOnly = process.env.CSP_REPORT_ONLY === 'true'

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: cspDirectives,
    reportOnly: cspReportOnly
  },
  crossOriginEmbedderPolicy: false // Permet chargement fonts Google, etc.
}))

if (cspReportOnly) {
  logger.warn('⚠️ CSP en mode report-only (CSP_REPORT_ONLY=true) : les violations sont signalées, pas bloquées')
}
app.use(compression()) // Compression gzip/deflate des réponses
app.use(cors(corsOptions))
// Limite taille JSON : protection contre payload DoS (100 Ko max)
app.use(express.json({ limit: '100kb' }))

// Logger des requêtes HTTP (détails en DEBUG uniquement)
app.use(logger.requestLogger())

// Routes API
import geoRouter from './routes/geo'

// Router PDF : monté uniquement si ENABLE_PDF_ROUTES=true (désactivé par défaut).
// SÉCURITÉ : l'export PDF n'est pas exposé dans l'UI (cf. utils/featureFlags.ts).
// Le require est paresseux pour ne pas charger Puppeteer/PDFKit quand le flag est off.
const pdfRoutesEnabled = arePdfRoutesEnabled()

if (pdfRoutesEnabled) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfRouter = require('./routes/pdf').default

    app.use('/api/pdf', pdfLimiter)
    // Route de test : développement uniquement
    if (process.env.NODE_ENV !== 'production') {
      pdfRouter.get('/test', (req: Request, res: Response) => {
        res.json({ status: 'OK', message: 'Route PDF test fonctionnelle' })
      })
    }

    app.use('/api/pdf', pdfRouter)
    logger.warn('⚠️ Routes /api/pdf activées (ENABLE_PDF_ROUTES=true) : vérifier la limite de concurrence Puppeteer')
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de la route pdf:', error)
  }
} else {
  logger.info('🔒 Routes /api/pdf désactivées (ENABLE_PDF_ROUTES absent ou ≠ true)')
}

// Router geo (rate limit API générale)
try {
  app.use('/api', apiLimiter)
  app.use('/api', geoRouter)
  logger.success('✅ Route /api chargée avec succès')
} catch (error) {
  logger.error('❌ Erreur lors du chargement de la route geo:', error)
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Servir les fichiers statiques du frontend
const publicPath = path.join(__dirname, 'public')
if (fs.existsSync(publicPath)) {
  // Les fichiers dans /assets/ ont un hash dans le nom (ex: index-7eb192c6.js)
  // On peut les cacher longtemps car le hash change à chaque build
  app.use('/assets', express.static(path.join(publicPath, 'assets'), {
    maxAge: '1y',           // Cache 1 an (fichiers avec hash)
    immutable: true,        // Indique que le fichier ne changera jamais (même URL = même contenu)
    etag: true
  }))
  // Les autres fichiers statiques (index.html, favicon, etc.) ne doivent pas être cachés longtemps
  app.use(express.static(publicPath, {
    maxAge: '0',            // Pas de cache pour index.html (doit toujours être frais)
    etag: true
  }))
  logger.info('✅ Fichiers statiques servis depuis:', { path: publicPath })
} else {
  logger.warn(`⚠️ Le dossier public n'existe pas: ${publicPath}`)
}

// Handler d'erreur 404 pour les routes API
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  // Le router PDF gère lui-même ses chemins quand il est monté.
  // S'il est désactivé, /api/pdf/* doit recevoir le 404 JSON standard.
  if (pdfRoutesEnabled && req.path.startsWith('/pdf')) {
    return next()
  }

  const fullPath = `/api${req.path}`
  logger.warn(`⚠️ Route API non trouvée: ${req.method} ${fullPath}`)
  
  res.status(404).json({
    error: 'Route API non trouvée',
    ...(process.env.NODE_ENV === 'production'
      ? {}
      : {
          path: fullPath,
          method: req.method,
          message: 'La route demandée n\'existe pas sur le serveur.',
          hint: 'Vérifiez que la route est bien définie dans les routers API'
        })
  })
})

// Route catch-all pour SPA
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    return next()
  }
  
  if (req.path === '/health') {
    return next()
  }
  
  const indexPath = path.join(__dirname, 'public', 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).json({ 
      error: 'Application non disponible', 
      message: 'Le fichier index.html n\'a pas été trouvé. Assurez-vous que le frontend a été buildé.' 
    })
  }
})

// Middleware d'erreur global : capture les erreurs non gérées par les routers individuels
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500
  logger.error('Erreur non gérée (middleware global)', err, {
    path: req.path,
    method: req.method
  })
  res.status(statusCode).json({
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'production'
      ? 'Une erreur interne est survenue.'
      : err.message
  })
})

// Écouter sur toutes les interfaces
const HOST = process.env.HOST || '0.0.0.0'

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Erreur non capturée', error)
  setTimeout(() => process.exit(1), 1000)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesse rejetée non gérée', { reason, promise })
})

// Démarrer le serveur
try {
  const server = app.listen(Number(PORT), HOST, () => {
    logger.success(`Serveur démarré sur http://${HOST}:${PORT}`)
    logger.api(`API disponible sur http://${HOST}:${PORT}/api`)
    logger.info('Environnement', { 
      nodeEnv: process.env.NODE_ENV,
      host: HOST,
      port: PORT 
    })
  })

  server.timeout = 10 * 60 * 1000 // 10 minutes
  server.keepAliveTimeout = 10 * 60 * 1000 // 10 minutes

  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Le port ${PORT} est déjà utilisé`)
    } else {
      logger.error('Erreur serveur', error)
    }
    setTimeout(() => process.exit(1), 1000)
  })
} catch (error) {
  logger.error('Erreur lors du démarrage du serveur', error)
  process.exit(1)
}
