/**
 * Contrôleur pour les opérations liées aux données statistiques
 * Gère la logique métier des routes /data/communes
 */

import { Request, Response } from 'express'
import { databaseService, validatePgSchema } from '../services/database'
import { demographieRepository } from '../repositories/DemographieRepository'
import { habitatRepository } from '../repositories/HabitatRepository'
import { economieRepository } from '../repositories/EconomieRepository'
import { formationRepository } from '../repositories/FormationRepository'
import { solidariteRepository } from '../repositories/SolidariteRepository'
import { agricultureRepository } from '../repositories/AgricultureRepository'
import { ValidationService } from '../services/validation'
import { logger } from '../services/logger'
import { createErrorResponse, sanitizeClientPayload } from '../utils/common'

class DataController {
  /**
   * Récupérer toutes les données démographiques d'une commune
   * Inclut: population, évolution, pyramide des âges, ménages
   */
  async getDemographics(req: Request, res: Response) {
    const codeInsee = ValidationService.validateCodeInsee(req.params.codeInsee)
    
    try {
      const data = await demographieRepository.getDemographieData(codeInsee)
      
      if (!data) {
        return res.status(404).json(createErrorResponse(
          new Error('Aucune donnée démographique trouvée'), 
          'Récupération données démographiques'
        ))
      }

      res.json(sanitizeClientPayload(data))
    } catch (error: any) {
      logger.error(`Erreur démographie ${codeInsee}:`, error)
      res.status(500).json(createErrorResponse(error, 'Erreur serveur'))
    }
  }

  /**
   * Récupérer toutes les données habitat d'une commune
   * Inclut: parc, construction, marché
   */
  async getHousing(req: Request, res: Response) {
    const codeInsee = ValidationService.validateCodeInsee(req.params.codeInsee)
    
    try {
      const data = await habitatRepository.getHabitatData(codeInsee)
      
      if (!data) {
        return res.status(404).json(createErrorResponse(
          new Error('Aucune donnée habitat trouvée'), 
          'Récupération données habitat'
        ))
      }

      res.json(sanitizeClientPayload(data))
    } catch (error: any) {
      logger.error(`Erreur habitat ${codeInsee}:`, error)
      res.status(500).json(createErrorResponse(error, 'Erreur serveur'))
    }
  }

  /**
   * Récupérer toutes les données économie et emploi
   */
  async getEconomy(req: Request, res: Response) {
    const codeInsee = ValidationService.validateCodeInsee(req.params.codeInsee)
    
    try {
      const data = await economieRepository.getEconomieData(codeInsee)
      
      if (!data) {
        return res.status(404).json(createErrorResponse(
          new Error('Aucune donnée économie trouvée'), 
          'Récupération données économie'
        ))
      }

      res.json(sanitizeClientPayload(data))
    } catch (error: any) {
      logger.error(`Erreur économie ${codeInsee}:`, error)
      res.status(500).json(createErrorResponse(error, 'Erreur serveur'))
    }
  }

  /**
   * Récupérer toutes les données formation (enseignement)
   */
  async getFormation(req: Request, res: Response) {
    const codeInsee = ValidationService.validateCodeInsee(req.params.codeInsee)
    
    try {
      const data = await formationRepository.getFormationData(codeInsee)
      
      if (!data) {
        return res.status(404).json(createErrorResponse(
          new Error('Aucune donnée formation trouvée'), 
          'Récupération données formation'
        ))
      }

      res.json(sanitizeClientPayload(data))
    } catch (error: any) {
      logger.error(`Erreur formation ${codeInsee}:`, error)
      res.status(500).json(createErrorResponse(error, 'Erreur serveur'))
    }
  }

  /**
   * Récupérer toutes les données solidarité
   */
  async getSolidarite(req: Request, res: Response) {
    const codeInsee = ValidationService.validateCodeInsee(req.params.codeInsee)
    
    try {
      const data = await solidariteRepository.getSolidariteData(codeInsee)
      
      if (!data) {
        return res.status(404).json(createErrorResponse(
          new Error('Aucune donnée solidarité trouvée'), 
          'Récupération données solidarité'
        ))
      }

      res.json(sanitizeClientPayload(data))
    } catch (error: any) {
      logger.error(`Erreur solidarité ${codeInsee}:`, error)
      res.status(500).json(createErrorResponse(error, 'Erreur serveur'))
    }
  }

  /**
   * Récupérer toutes les données agriculture
   * Inclut: exploitations, SAU, production, démographie agricole
   */
  async getAgriculture(req: Request, res: Response) {
    const codeInsee = ValidationService.validateCodeInsee(req.params.codeInsee)
    
    logger.stats(`Récupération données agriculture pour ${codeInsee}`)
    
    try {
      const data = await agricultureRepository.getAgricultureData(codeInsee)
      
      if (!data) {
        return res.status(404).json(createErrorResponse(
          new Error('Aucune donnée agriculture trouvée'), 
          'Récupération données agriculture'
        ))
      }

      res.json(sanitizeClientPayload(data))
    } catch (error: any) {
      logger.error(`Erreur agriculture ${codeInsee}:`, error)
      res.status(500).json(createErrorResponse(error, 'Erreur serveur'))
    }
  }

  /**
   * Diagnostic Formation : exécute une requête directe (sans cache) pour déboguer les données à 0.
   * GET /api/debug/formation/35238
   * Essaie d'abord code_insee_concat = $1, puis code_insee_concat::text = $1 si 0 lignes.
   */
  async getFormationDebug(req: Request, res: Response) {
    const codeInsee = ValidationService.validateCodeInsee(req.params.codeInsee)
    const schema = validatePgSchema(process.env.PGSCHEMA || '_a_vues_portrait_commune_yl')

    try {
      let r = await databaseService.pool.query(
        `SELECT code_insee_concat, lib_com, numero_annee, nb_eleves_pre_elementaire, nb_eleves_elementaire
         FROM ${schema}.v_formation_evol_primaire_eleves_classes_2024
         WHERE code_insee_concat = $1
         ORDER BY numero_annee ASC`,
        [codeInsee]
      )
      let whereUsed = 'code_insee_concat = $1'
      if (r.rows.length === 0) {
        r = await databaseService.pool.query(
          `SELECT code_insee_concat, lib_com, numero_annee, nb_eleves_pre_elementaire, nb_eleves_elementaire
           FROM ${schema}.v_formation_evol_primaire_eleves_classes_2024
           WHERE code_insee_concat::text = $1
           ORDER BY numero_annee ASC`,
          [codeInsee]
        )
        whereUsed = 'code_insee_concat::text = $1'
      }
      res.json({
        codeInsee,
        schema,
        whereUsed,
        rowCount: r.rows.length,
        sample: r.rows.slice(0, 3),
        allRows: r.rows
      })
    } catch (error: any) {
      logger.error(`Debug formation ${codeInsee}:`, error)
      res.status(500).json(createErrorResponse(error, 'Erreur debug formation'))
    }
  }

  /**
   * Récupérer l'évolution temporelle d'un indicateur (Méthode générique conservée)
   */
  async getEvolution(req: Request, res: Response) {
    const codeInsee = ValidationService.validateCodeInsee(req.params.codeInsee)
    const indicator = ValidationService.validateIndicator(req.query.indicator)
    
    
    try {
      const historique = await databaseService.getIndicateursMenuages({ codeInsee: codeInsee })
      
      if (!historique || historique.length === 0) {
        return res.status(404).json(createErrorResponse(
          new Error('Aucune donnée d\'évolution trouvée'), 
          'Récupération évolution temporelle'
        ))
      }

      const evolutionData = historique
        .filter((item: any) => item[indicator] !== null && item[indicator] !== undefined)
        .map((item: any) => ({
          annee: item.annee,
          year: item.annee,
          [indicator]: item[indicator],
          value: item[indicator]
        }))
        .sort((a: any, b: any) => a.annee - b.annee)

      res.json(evolutionData)
    } catch (error: any) {
      logger.error(`Erreur évolution ${codeInsee}:`, error)
      res.status(500).json(createErrorResponse(error, 'Erreur serveur'))
    }
  }
}

export const dataController = new DataController()

