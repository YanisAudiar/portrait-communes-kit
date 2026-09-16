import { Pool, PoolConfig, QueryResult } from 'pg'
import { ensureNumeric } from '../utils/common'
import { globalCache } from './cache'
import { logger } from './logger'
import dotenv from 'dotenv'

dotenv.config()

// Validation des variables d'environnement PostgreSQL
const pgHost = process.env.PGHOST
if (!pgHost) {
  logger.error('PGHOST n\'est pas défini dans les variables d\'environnement')
  throw new Error('PGHOST est requis pour la connexion à la base de données')
}

/** Valide le schéma PostgreSQL (sécurité : injection, caractères spéciaux) */
export function validatePgSchema(schema: string): string {
  const schemaRegex = /^[a-zA-Z0-9_]+$/
  if (!schema || typeof schema !== 'string') {
    throw new Error('PGSCHEMA invalide : doit être une chaîne non vide')
  }
  const trimmed = schema.trim()
  if (!schemaRegex.test(trimmed)) {
    throw new Error('PGSCHEMA invalide : uniquement lettres, chiffres et underscores autorisés (ex: a_z0_9)')
  }
  if (trimmed.length > 63) {
    throw new Error('PGSCHEMA invalide : maximum 63 caractères (limite PostgreSQL)')
  }
  return trimmed
}

// Si PGHOST est 'localhost', forcer l'utilisation d'IPv4 pour éviter les problèmes avec IPv6
const resolvedHost = pgHost === 'localhost' ? '127.0.0.1' : pgHost

// SSL : rejectUnauthorized=true par défaut. PGSSL_REJECT_UNAUTHORIZED=false pour certificat auto-signé en dev.
const sslRejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false'

// Configuration de la base de données PostgreSQL
const dbConfig: PoolConfig = {
  host: resolvedHost,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSLMODE ? { rejectUnauthorized: sslRejectUnauthorized } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// Flag pour éviter les logs répétitifs lors des redémarrages
let configLogged = false

export interface IndicateurData {
  codeInsee: string
  commune: string
  annee: number
  nbMenages: number
  tailleMoyenneMenage: number
  partPersonnesSeules: number
  partCouples: number
  partFamillesMonoparentales: number
  partAutres: number
  nbLogements: number
  partMaisons: number
  partAppartements: number
  population: number
}

export interface QueryOptions {
  codeInsee?: string
  annee?: number
  codesInsee?: string[]
  limit?: number
}

export class DatabaseService {
  pool: Pool
  /** Schéma unique : toutes les vues (démographie, habitat, économie, etc.) */
  schema: string
  cache: any

  constructor() {
    this.pool = new Pool(dbConfig)
    const rawSchema = process.env.PGSCHEMA || '_a_vues_portrait_commune_yl'
    this.schema = validatePgSchema(rawSchema)
    this.cache = globalCache // Utiliser le cache unifié
    
    // Log de la configuration une seule fois au démarrage (sans le mot de passe)
    // Utiliser un flag pour éviter les logs répétitifs lors des redémarrages PM2
    if (!configLogged) {
      if (this.schema.includes('portrrait')) {
        logger.warn('Attention : typo dans PGSCHEMA : "portrrait" → utiliser "portrait" (un seul r)')
      }
      logger.info('Configuration base de données', {
        host: dbConfig.host,
        schema: this.schema
      })
      configLogged = true
    }
  }

  /**
   * Transformer les données brutes de la base vers un format standardisé (camelCase)
   */
  transformIndicateursData(rows: any[]): IndicateurData[] {
    return rows.map(row => ({
      // Identifiants
      codeInsee: row.code_insee_concat,
      commune: row.lib_com,
      annee: ensureNumeric(row.numero_annee),
      
      // Ménages
      nbMenages: ensureNumeric(row.nb_men),
      tailleMoyenneMenage: ensureNumeric(row.taille_moy_men),
      
      // Composition des ménages
      partPersonnesSeules: ensureNumeric(row.part_personnes_seules_men),
      partCouples: ensureNumeric(row.part_couples),
      partFamillesMonoparentales: ensureNumeric(row.part_familles_monoparentales),
      partAutres: ensureNumeric(row.part_autres),
      
      // Logements
      nbLogements: ensureNumeric(row.nb_logements),
      partMaisons: ensureNumeric(row.part_maisons),
      partAppartements: ensureNumeric(row.part_appartements),
      
      // Population
      population: ensureNumeric(row.population)
    }))
  }

  /**
   * Construire une requête SQL avec conditions dynamiques
   */
  buildIndicateursQuery(baseQuery: string, options: QueryOptions = {}) {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Filtre par code INSEE
    if (options.codeInsee) {
      conditions.push(`code_insee_concat = $${paramIndex}`)
      params.push(options.codeInsee)
      paramIndex++
    }

    // Filtre par année
    if (options.annee) {
      conditions.push(`numero_annee = $${paramIndex}`)
      params.push(options.annee)
      paramIndex++
    }

    // Filtre par codes INSEE multiples
    if (options.codesInsee && Array.isArray(options.codesInsee)) {
      const placeholders = options.codesInsee.map((_, index) => `$${paramIndex + index}`).join(',')
      conditions.push(`code_insee_concat IN (${placeholders})`)
      params.push(...options.codesInsee)
      paramIndex += options.codesInsee.length
    }

    let query = baseQuery
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    // Ordre par défaut
    query += ` ORDER BY lib_com, numero_annee DESC`

    // Limite
    if (options.limit) {
      query += ` LIMIT $${paramIndex}`
      params.push(options.limit)
    }

    return { query, params }
  }

  /**
   * Test de connexion à la base de données
   */
  async testConnection() {
    try {
      const client = await this.pool.connect()
      const result = await client.query('SELECT NOW()')
      client.release()
      
      return {
        status: 'OK',
        timestamp: result.rows[0].now,
        config: {
          host: dbConfig.host,
          database: dbConfig.database,
          port: dbConfig.port,
          user: dbConfig.user,
          schema: this.schema,
          ssl: !!dbConfig.ssl
        }
      }
    } catch (error: any) {
      return {
        status: 'ERROR',
        error: error.message,
        config: {
          host: dbConfig.host,
          database: dbConfig.database,
          port: dbConfig.port,
          user: dbConfig.user,
          schema: this.schema
        }
      }
    }
  }

  // === MÉTHODES MIGRÉES VERS LES REPOSITORIES ===
  // Les méthodes getDemographieData, getHabitatData, getEconomieData, getFormationData, getSolidariteData
  // ont été déplacées dans leurs repositories respectifs (backend/repositories/*Repository.js)


  // === ANCIENNES MÉTHODES DE L'ANCIENNE APP (GARDÉES POUR COMPATIBILITÉ SI NÉCESSAIRE) ===

  /**
   * Récupérer les indicateurs de ménages par commune
   */
  async getIndicateursMenuages(options: QueryOptions = {}) {
    // SÉCURITÉ : clé construite sur les seules options utilisées par la requête,
    // et normalisée (ordre des champs stable, codesInsee triés) pour éviter que des
    // variantes équivalentes multiplient les entrées de cache.
    const cacheKey = `db_indicateurs_menages_${JSON.stringify({
      codeInsee: options.codeInsee ?? null,
      annee: options.annee ?? null,
      codesInsee: Array.isArray(options.codesInsee) ? [...options.codesInsee].sort() : null,
      limit: options.limit ?? null
    })}`

    return this.cache.getOrSet(cacheKey, async () => {
      const baseQuery = `
        SELECT 
          code_insee_concat,
          lib_com,
          numero_annee,
          nb_men,
          part_personnes_seules_men,
          taille_moy_men
        FROM ${this.schema}.v_demo_indicateurs_menages_par_com
      `
      
      const { query, params } = this.buildIndicateursQuery(baseQuery, options)

      logger.debug('Requête indicateurs ménages')

      const result = await this.pool.query(query, params)
      
      // Transformer les résultats pour une utilisation plus facile
      const data = this.transformIndicateursData(result.rows)

      logger.debug(`${data.length} indicateurs récupérés`)
      return data
    })
  }

  /**
   * Récupérer les dernières données d'indicateurs par commune (année la plus récente)
   */
  async getLatestIndicateursMenuages(codesInsee: string[] | null = null) {
    try {
      let query = `
        WITH latest_year AS (
          SELECT MAX(numero_annee) as max_year
          FROM ${this.schema}.v_demo_indicateurs_menages_par_com
        )
        SELECT 
          i.code_insee_concat,
          i.lib_com,
          i.numero_annee,
          i.nb_men,
          i.part_personnes_seules_men,
          i.taille_moy_men
        FROM ${this.schema}.v_demo_indicateurs_menages_par_com i
        CROSS JOIN latest_year ly
        WHERE i.numero_annee = ly.max_year
      `
      
      const params: any[] = []
      
      if (codesInsee && Array.isArray(codesInsee)) {
        const placeholders = codesInsee.map((_, index) => `$${index + 1}`).join(',')
        query += ` AND i.code_insee_concat IN (${placeholders})`
        params.push(...codesInsee)
      }

      query += ` ORDER BY i.lib_com`

      logger.debug('Requête derniers indicateurs')
      
      const result = await this.pool.query(query, params)
      
      const data = this.transformIndicateursData(result.rows)

      logger.debug(`${data.length} derniers indicateurs récupérés`, { annee: data[0]?.annee })
      return data

    } catch (error: any) {
      logger.error('Erreur récupération derniers indicateurs', error)
      throw new Error(`Erreur base de données: ${error.message}`)
    }
  }

  /**
   * Vider le cache de la base de données
   */
  clearCache() {
    // Supprimer uniquement les clés de base de données du cache global
    const keys = this.cache.keys()
    const dbKeys = keys.filter((key: string) => key.startsWith('db_') || key.includes('_data_'))
    dbKeys.forEach((key: string) => this.cache.delete(key))
    logger.cache(`Cache base de données vidé: ${dbKeys.length} éléments`)
  }

  /**
   * Fermer la connexion
   */
  async close() {
    await this.pool.end()
    logger.info('Connexion base de données fermée')
  }
}

// Instance singleton
export const databaseService = new DatabaseService()

// Gérer la fermeture propre
process.on('SIGINT', async () => {
  await databaseService.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await databaseService.close()
  process.exit(0)
})

