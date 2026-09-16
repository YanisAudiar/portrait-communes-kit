import type { SiteConfig } from './site'

/**
 * Territoire fictif aligné sur backend/sql/sample (Nordville, Sudville, Estville).
 * Activé par VITE_USE_SAMPLE_TERRITORY=true (Docker Compose du kit).
 */
export const siteConfigSample: SiteConfig = {
  territory: {
    name: 'Territoire d’exemple',
    shortName: 'EX',
    productTitle: 'Portraits de communes',
    mapCenter: [-1.68, 48.11],
    mapBounds: [
      [-1.8, 48.0],
      [-1.5, 48.25]
    ],
    communeCodes: ['99101', '99102', '99103']
  },
  agency: {
    name: 'Agence exemple',
    shortName: 'EXEMPLE',
    siret: 'à renseigner',
    director: 'à renseigner',
    email: 'contact@example.org',
    phone: '',
    addressLines: ['Adresse à renseigner'],
    website: 'https://example.org',
    websiteLabel: 'example.org',
    contactUrl: 'https://example.org/contact',
    copyrightProduct: 'Portrait de communes',
    fullTitle: 'Agence d’urbanisme (jeu d’essai)',
    mentionsUpdated: 'septembre 2026',
    placeLabel: 'EXEMPLE'
  },
  partner: null
}
