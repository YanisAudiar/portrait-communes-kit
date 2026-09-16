/**
 * Liens "Pour en savoir plus" par thématique — à adapter par agence
 * (publications, observatoires, etc.).
 *
 * Structure d'un lien :
 * - alias (obligatoire) : texte affiché
 * - url (obligatoire) : URL cible
 * - img (optionnel) : URL résolue de l'image (si présent, le lien s'affiche en image)
 */

export interface DashboardLink {
  alias: string
  url: string
  img?: string
}

/** Liens par thème (themeId -> liens) */
export const themeLinks: Record<string, DashboardLink[]> = {
  demographie: [
    {
      alias: 'Publications Audiar Démographie',
      url: 'https://www.audiar.org/publications/?thematique%5B%5D=cohesion-sociale&sous-thematique%5B%5D=demographie'
    }
  ],
  habitat: [
    {
      alias: 'Publications de l\'Audiar',
      url: 'https://www.audiar.org/publications/?thematique%5B%5D=cohesion-sociale&sous-thematique%5B%5D=logement-social&sous-thematique%5B%5D=habitat'
    },
    // Observatoire habitat : img retiré temporairement (logo obsolète)
    {
      alias: 'Observatoire de l\'habitat',
      url: 'http://obs-habitat-guest.audiar.org'
    }
  ],
  enseignement: [
    {
      alias: 'Publications Audiar Enseignement',
      url: 'https://www.audiar.org/publications/?thematique%5B%5D=economie&sous-thematique%5B%5D=enseignement-superieur'
    }
  ],
  'economie-emploi': [
    {
      alias: 'Publications Audiar Économie',
      url: 'https://www.audiar.org/publications/?thematique%5B%5D=economie'
    },
    {
      alias: 'Observatoire de l\'économie',
      url: 'http://obs-economie-guest.audiar.org'
    }
  ],
  solidarite: [
    {
      alias: 'Publications Audiar Solidarité',
      url: 'https://www.audiar.org/publications/?thematique%5B%5D=cohesion-sociale'
    }
  ],
  'energie-environnement': [
    {
      alias: 'Publications Audiar Environnement',
      url: 'https://www.audiar.org/publications/?thematique%5B%5D=environnement'
    }
  ],
  mobilites: [
    {
      alias: 'Publications Audiar Mobilités',
      url: 'https://www.audiar.org/publications/?thematique%5B%5D=environnement&sous-thematique%5B%5D=mobilites'
    }
  ],
  agriculture: [
    {
      alias: 'Publications Audiar Agriculture',
      url: 'https://www.audiar.org/publications/?thematique%5B%5D=economie&sous-thematique%5B%5D=agriculture-economie'
    }
  ],
  'equipement-services': [
    {
      alias: 'Publications Audiar Équipements et services',
      url: 'https://www.audiar.org/publications/?thematique%5B%5D=urbanisme'
    }
  ]
}

/**
 * Retourne les liens pour un thème donné.
 * @param themeId - Identifiant du thème (ex: 'demographie', 'habitat')
 * @returns Tableau des liens du thème, ou tableau vide si aucun
 */
export function getLinksByTheme(themeId: string): DashboardLink[] {
  return themeLinks[themeId] ?? []
}

/**
 * Retourne tous les liens de tous les thèmes (pour pages sans contexte thème).
 * Utilisé sur Dashboard, Landing, Mentions légales.
 */
export function getAllLinks(): DashboardLink[] {
  const all: DashboardLink[] = []
  for (const links of Object.values(themeLinks)) {
    all.push(...links)
  }
  return all
}
