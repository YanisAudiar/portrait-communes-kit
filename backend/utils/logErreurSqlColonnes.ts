/**
 * Utilitaire pour logger les erreurs SQL PostgreSQL de manière structurée.
 * Aide à identifier les colonnes/vues manquantes et suggère des alternatives.
 */

import { logger } from '../services/logger'

/** Suggestions de colonnes alternatives selon l'erreur */
const SUGGESTIONS_COLONNES: Record<string, string> = {
  lib_com: '→ Tester lib_geo (convention Baro)',
  lib_geo: '→ Tester lib_com (convention Portrait)',
  code_insee_concat: '→ Tester code_geo (convention Baro)',
  code_geo: '→ Tester code_insee_concat (convention Portrait)',
}

/**
 * Extrait la colonne ou relation manquante du message d'erreur PostgreSQL
 */
function extraireElementManquant(message: string): { type: 'colonne' | 'relation'; nom: string } | null {
  // "la colonne « lib_com » n'existe pas" ou "la colonne c.code_insee_concat n'existe pas"
  const matchColonne = message.match(/la colonne\s+(?:«\s*)?([a-z0-9_.]+)(?:\s*»)?\s+n'existe pas/i)
  if (matchColonne) {
    const nom = matchColonne[1].replace(/^[a-z]+\./, '') // enlever préfixe alias (c.)
    return { type: 'colonne', nom }
  }
  // "la relation « schema.vue » n'existe pas"
  const matchRelation = message.match(/la relation\s+[«"]([^»"]+)[»"]\s+n'existe pas/i)
  if (matchRelation) {
    return { type: 'relation', nom: matchRelation[1] }
  }
  return null
}

/**
 * Retourne une suggestion pour la colonne manquante
 */
function getSuggestionColonne(nomColonne: string): string {
  const base = nomColonne.replace(/^[a-z]+\./, '')
  return SUGGESTIONS_COLONNES[base] || '→ Vérifier la structure de la vue dans PostgreSQL'
}

/**
 * Log une erreur SQL avec contexte pour faciliter le diagnostic.
 * À utiliser dans les repositories lors d'un catch d'erreur PostgreSQL.
 *
 * @param repository - Nom du repository (ex: DemographieRepository)
 * @param queryName - Nom de la requête/vue (ex: v_demo_pop_evol_par_com)
 * @param error - Erreur PostgreSQL
 * @param vue - Nom complet de la vue (optionnel, pour relation manquante)
 */
export function logErreurSqlColonnes(
  repository: string,
  queryName: string,
  error: { message: string },
  vue?: string
): void {
  const msg = error.message
  const element = extraireElementManquant(msg)

  // Log concis sans stack trace pour réduire le bruit
  const metaSansStack = { message: msg }
  if (element) {
    if (element.type === 'colonne') {
      const suggestion = getSuggestionColonne(element.nom)
      logger.error(`SQL ${repository} [${queryName}]`, null, {
        ...metaSansStack,
        colonneManquante: element.nom,
        suggestion,
        vue: vue || queryName,
      })
    } else {
      logger.error(`SQL ${repository} [${queryName}]`, null, {
        ...metaSansStack,
        relationManquante: element.nom.trim(),
        suggestion: '→ Vérifier que la vue existe dans le schéma ou migrer vers une vue Baro équivalente',
      })
    }
  } else {
    logger.error(`SQL ${repository} [${queryName}]: ${msg}`, null, metaSansStack)
  }
}
