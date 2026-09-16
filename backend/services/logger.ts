/**
 * Service de logging structuré pour l'application
 * Remplace les console.log dispersés par un système unifié
 */

import fs from 'fs'
import path from 'path'
import os from 'os'
import { Request, Response, NextFunction } from 'express'

// Niveaux de log
const LOG_LEVELS: Record<string, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

// Couleurs pour la console
const COLORS: Record<string, string> = {
  ERROR: '\x1b[31m', // Rouge
  WARN: '\x1b[33m',  // Jaune
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'
}

// Emojis pour les logs
const EMOJIS: Record<string, string> = {
  ERROR: '❌',
  WARN: '⚠️',
  INFO: 'ℹ️',
  DEBUG: '🔍',
  SUCCESS: '✅',
  START: '🚀',
  STOP: '🛑',
  DATABASE: '💾',
  CACHE: '📦',
  API: '🌐',
  MAP: '🗺️',
  SEARCH: '🔍',
  STATS: '📊'
}

export interface LoggerOptions {
  enableConsole?: boolean
  enableFile?: boolean
  logsDir?: string
}

export class Logger {
  level: number
  enableConsole: boolean
  enableFile: boolean
  logsDir: string

  constructor(options: LoggerOptions = {}) {
    this.level = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase() || 'INFO'] ?? LOG_LEVELS.INFO
    this.enableConsole = options.enableConsole !== false
    this.enableFile = options.enableFile || process.env.NODE_ENV === 'production'
    this.logsDir = options.logsDir || path.join(__dirname, '../../logs')
    
    // Créer le dossier logs s'il n'existe pas
    if (this.enableFile && !fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true })
    }
  }

  /**
   * Formater un message de log
   */
  formatMessage(level: string, message: string, meta: object = {}) {
    const timestamp = new Date().toISOString()
    
    return {
      timestamp,
      level,
      message,
      ...meta,
      pid: process.pid,
      hostname: os.hostname()
    }
  }

  /**
   * Écrire dans un fichier log
   */
  writeToFile(level: string, formattedMessage: object) {
    if (!this.enableFile) return

    const filename = `${level.toLowerCase()}.log`
    const filepath = path.join(this.logsDir, filename)
    const logLine = JSON.stringify(formattedMessage) + '\n'

    try {
      fs.appendFileSync(filepath, logLine)
    } catch (error) {
      console.error('Erreur écriture log:', error)
    }
  }

  /**
   * Écrire dans la console avec couleur
   */
  writeToConsole(level: string, message: string, meta: object = {}) {
    if (!this.enableConsole) return

    const color = COLORS[level]
    const reset = COLORS.RESET
    const emoji = EMOJIS[level] || ''
    const timestamp = new Date().toISOString()

    let output = `${color}[${timestamp}] ${emoji} ${level}${reset}: ${message}`

    if (Object.keys(meta).length > 0) {
      output += ` ${JSON.stringify(meta)}`
    }

    console.log(output)
  }

  /**
   * Log générique
   */
  log(level: string, message: string, meta: object = {}) {
    const levelValue = LOG_LEVELS[level]

    if (levelValue > this.level) {
      return // Ne pas logger si le niveau est trop élevé
    }

    const formattedMessage = this.formatMessage(level, message, meta)

    this.writeToConsole(level, message, meta)
    this.writeToFile(level, formattedMessage)
  }

  /**
   * Log ERROR
   */
  error(message: string, error: any = null, meta: object = {}) {
    const errorMeta = {
      ...meta,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: error.code
      } : undefined
    }
    this.log('ERROR', message, errorMeta)
  }

  /**
   * Log WARN
   */
  warn(message: string, meta: object = {}) {
    this.log('WARN', message, meta)
  }

  /**
   * Log INFO
   */
  info(message: string, meta: object = {}) {
    this.log('INFO', message, meta)
  }

  /**
   * Log DEBUG
   */
  debug(message: string, meta: object = {}) {
    this.log('DEBUG', message, meta)
  }

  /**
   * Logs spécifiques avec emojis
   */
  success(message: string, meta: object = {}) {
    const successMessage = `${EMOJIS.SUCCESS} ${message}`
    this.info(successMessage, meta)
  }

  database(message: string, meta: object = {}) {
    const dbMessage = `${EMOJIS.DATABASE} ${message}`
    this.info(dbMessage, meta)
  }

  cache(message: string, meta: object = {}) {
    const cacheMessage = `${EMOJIS.CACHE} ${message}`
    this.info(cacheMessage, meta)
  }

  api(message: string, meta: object = {}) {
    const apiMessage = `${EMOJIS.API} ${message}`
    this.info(apiMessage, meta)
  }

  map(message: string, meta: object = {}) {
    const mapMessage = `${EMOJIS.MAP} ${message}`
    this.info(mapMessage, meta)
  }

  search(message: string, meta: object = {}) {
    const searchMessage = `${EMOJIS.SEARCH} ${message}`
    this.info(searchMessage, meta)
  }

  stats(message: string, meta: object = {}) {
    const statsMessage = `${EMOJIS.STATS} ${message}`
    this.info(statsMessage, meta)
  }

  /**
   * Middleware Express pour logger les requêtes
   */
  requestLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now()
      
      res.on('finish', () => {
        const duration = Date.now() - start
        const { method, originalUrl } = req
        const { statusCode } = res
        const meta = { method, url: originalUrl, statusCode, duration: `${duration}ms` }
        // Erreurs 4xx/5xx en INFO, succès en DEBUG pour réduire le bruit
        if (statusCode >= 400) {
          this.warn('HTTP Request', meta)
        } else {
          this.debug('HTTP Request', meta)
        }
      })

      next()
    }
  }

  /**
   * Middleware Express pour logger les erreurs
   */
  errorLogger() {
    return (error: any, req: Request, res: Response, next: NextFunction) => {
      this.error('HTTP Error', error, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      })
      next(error)
    }
  }
}

// Instance singleton
export const logger = new Logger()

