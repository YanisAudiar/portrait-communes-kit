/**
 * Identité du déploiement : territoire d'études + agence éditrice.
 *
 * Pour une autre agence : modifier ce fichier (et remplacer
 * `frontend/src/assets/images/logo-Audiar.svg` par votre logo).
 * Laisser `communeCodes` vide si la couche GeoServer ne contient déjà
 * que vos communes.
 */

import { siteConfigSample } from './site.sample'

export interface SitePartner {
  name: string
  addressLines: string[]
  phone: string
  website: string
  websiteLabel: string
}

export interface SiteAgency {
  name: string
  shortName: string
  siret: string
  director: string
  email: string
  phone: string
  addressLines: string[]
  website: string
  websiteLabel: string
  contactUrl: string
  linkedinUrl?: string
  copyrightProduct: string
  fullTitle: string
  mentionsUpdated: string
  /** Ligne sous le sigle dans le footer (ex. ville) */
  placeLabel: string
}

export interface SiteTerritory {
  /** Ex. « Rennes Métropole », « Pays de Brest » */
  name: string
  /** Sigle KPI / légendes (ex. « RM ») */
  shortName: string
  productTitle: string
  communeCodes: string[]
  /** [longitude, latitude] WGS84 */
  mapCenter: [number, number]
  /** [[ouest, sud], [est, nord]] */
  mapBounds: [[number, number], [number, number]]
  /** Code département INSEE, optionnel (filtre API historique) */
  inseeDepartment?: string
}

export interface SiteConfig {
  territory: SiteTerritory
  agency: SiteAgency
  /** Colonne partenaire du footer ; null pour la masquer partout */
  partner: SitePartner | null
}

export const siteConfigAudiar: SiteConfig = {
  territory: {
    name: 'Rennes Métropole',
    shortName: 'RM',
    productTitle: 'Portraits de communes',
    mapCenter: [-1.68, 48.11],
    mapBounds: [
      [-5.5, 47.0],
      [0.5, 49.0]
    ],
    inseeDepartment: '35',
    communeCodes: [
      '35238',
      '35001',
      '35022',
      '35024',
      '35032',
      '35039',
      '35047',
      '35051',
      '35055',
      '35058',
      '35059',
      '35065',
      '35066',
      '35076',
      '35079',
      '35080',
      '35081',
      '35088',
      '35120',
      '35131',
      '35139',
      '35144',
      '35180',
      '35189',
      '35196',
      '35204',
      '35206',
      '35208',
      '35210',
      '35216',
      '35363',
      '35240',
      '35245',
      '35250',
      '35266',
      '35275',
      '35278',
      '35281',
      '35315',
      '35334',
      '35351',
      '35352',
      '35353'
    ]
  },
  agency: {
    name: 'Audiar',
    shortName: 'AUDIAR',
    siret: '77773407000041',
    director: 'Pierre MAURA',
    email: 'communication@audiar.org',
    phone: '02 99 01 86 40',
    addressLines: [
      '3 rue Geneviève de Gaulle-Anthonioz',
      'CS 40716',
      '35207 Rennes Cedex 2'
    ],
    website: 'https://www.audiar.org',
    websiteLabel: 'www.audiar.org',
    contactUrl: 'https://www.audiar.org/contact',
    linkedinUrl: 'https://www.linkedin.com/company/audiar/',
    copyrightProduct: "Baro'Territoires",
    fullTitle:
      "Agence d'Urbanisme et de Développement Intercommunal de l'Agglomération Rennaise",
    mentionsUpdated: 'juin 2026',
    placeLabel: 'RENNES'
  },
  partner: {
    name: 'Pays de Rennes',
    addressLines: ['10 Rue de la Sauvaie', '35000 Rennes'],
    phone: '02 99 01 86 40',
    website: 'https://paysderennes.fr',
    websiteLabel: 'paysderennes.fr'
  }
}

/** Instance courante : Audiar par défaut, jeu d’essai si VITE_USE_SAMPLE_TERRITORY=true. */
export const siteConfig: SiteConfig =
  import.meta.env.VITE_USE_SAMPLE_TERRITORY === 'true' ? siteConfigSample : siteConfigAudiar

/** Filtre client : no-op si la liste de codes est vide (couche déjà bornée). */
export function hasTerritoryCommuneFilter(): boolean {
  return siteConfig.territory.communeCodes.length > 0
}

/** Département INSEE par défaut (carte, filtres, PDF). */
export function defaultInseeDepartment(): string {
  return siteConfig.territory.inseeDepartment || 'all'
}
