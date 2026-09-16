/**
 * Configuration de la carte et constantes
 */

import { siteConfig } from './site'

/**
 * Clé tuiles CARTO (optionnelle). Sans VITE_CARTO_API_KEY, fond OSM :
 * une clé en dur exposerait le quota de l'agence qui publie le code.
 */
const cartoApiKey = (import.meta.env && import.meta.env.VITE_CARTO_API_KEY) || ''

/** Ajoute le paramètre key requis par CARTO sur une URL de tuile raster */
const withCartoApiKey = (url) => {
  if (!cartoApiKey) return url
  return `${url}?key=${encodeURIComponent(cartoApiKey)}`
}

/**
 * Communes du territoire configuré (alias historique RENNES_METROPOLE_CODES).
 * Liste vide = ne pas filtrer côté client (couche GeoServer déjà bornée).
 */
export const TERRITORY_COMMUNE_CODES = siteConfig.territory.communeCodes
export const RENNES_METROPOLE_CODES = TERRITORY_COMMUNE_CODES

/**
 * Configuration initiale de la carte
 */
export const MAP_CONFIG = {
  defaultCenter: siteConfig.territory.mapCenter,

  defaultZoom: {
    mobile: 7,
    desktop: 8
  },

  maxZoom: 16,
  minZoom: 6,

  mapBounds: siteConfig.territory.mapBounds,
  /** @deprecated Utiliser mapBounds — conservé pour les appels existants */
  bretagneBounds: siteConfig.territory.mapBounds,
  
  // Performance
  maxTileCacheSize: 50,
  renderWorldCopies: false
}

/**
 * Configuration des tuiles de fond OSM (legacy)
 */
export const OSM_TILES_CONFIG = {
  type: 'raster',
  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  tileSize: 256,
  attribution: '© OpenStreetMap contributors'
}

/**
 * Fond de carte Carto Positron (tuiles raster, style clair).
 * Couche de base sous les polygones / labels communes (voir MAP_BASEMAP_STYLE_FRAGMENT).
 */
export const CARTO_POSITRON_TILES_CONFIG = {
  type: 'raster',
  tiles: [
    withCartoApiKey('https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'),
    withCartoApiKey('https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'),
    withCartoApiKey('https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'),
    withCartoApiKey('https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png')
  ],
  tileSize: 256,
  attribution: '© OpenStreetMap contributors © CARTO'
}

/**
 * Transparence du plan Positron (0 = invisible, 1 = opaque).
 * Valeur inférieure à 1 : le fond blanc sous-jacent se voit à travers les tuiles.
 */
export const MAP_POSITRON_RASTER_OPACITY = 0.35

/** Fond actif : CARTO Positron si une clé est fournie, sinon OpenStreetMap. */
export const ACTIVE_BASEMAP_TILES_CONFIG = cartoApiKey
  ? CARTO_POSITRON_TILES_CONFIG
  : OSM_TILES_CONFIG

/**
 * Style de base carte : fond blanc + raster semi-transparent.
 * Les couches communes s’ajoutent au-dessus via useMapInit.
 */
export const MAP_BASEMAP_STYLE_FRAGMENT = {
  sources: {
    'basemap-positron': {
      type: ACTIVE_BASEMAP_TILES_CONFIG.type,
      tiles: [...ACTIVE_BASEMAP_TILES_CONFIG.tiles],
      tileSize: ACTIVE_BASEMAP_TILES_CONFIG.tileSize,
      attribution: ACTIVE_BASEMAP_TILES_CONFIG.attribution
    }
  },
  layers: [
    {
      id: 'map-background-white',
      type: 'background',
      paint: {
        'background-color': '#ffffff'
      }
    },
    {
      id: 'basemap-positron',
      type: 'raster',
      source: 'basemap-positron',
      paint: {
        // Positron est volontairement lavé ; OSM doit rester lisible.
        'raster-opacity': cartoApiKey ? MAP_POSITRON_RASTER_OPACITY : 1
      }
    }
  ]
}

/**
 * Styles des couches de communes
 */
export const COMMUNES_LAYERS_STYLE = {
  fill: {
    id: 'communes-fill',
    type: 'fill',
    source: 'communes',
    paint: {
      'fill-color': 'rgba(49, 109, 123, 0.1)', // Couleur Audiar
      'fill-opacity': 0.2
    }
  },
  
  border: {
    id: 'communes-border',
    type: 'line',
    source: 'communes',
    paint: {
      'line-color': '#316D7B', // Couleur Audiar
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        6, 0.5,
        10, 1,
        14, 1.5
      ],
      'line-opacity': 0.6
    }
  },
  
  hover: {
    id: 'communes-hover',
    type: 'line',
    source: 'communes',
    paint: {
      'line-color': '#e74c3c',
      'line-width': 3,
      'line-opacity': 0
    }
  },
  
  labels: {
    id: 'communes-labels',
    type: 'symbol',
    source: 'communes',
    layout: {
      'text-field': [
        'coalesce',
        ['get', 'nom'],
        ['get', 'lib_com'],
        ['get', 'name'],
        'Commune'
      ],
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-size': [
        'interpolate',
        ['linear'],
        ['zoom'],
        9, 11,
        11, 13,
        13, 15
      ],
      'text-anchor': 'center',
      'text-allow-overlap': true,
      'text-ignore-placement': false,
      'text-optional': false
    },
    paint: {
      'text-color': '#316D7B',
      'text-halo-color': '#ffffff',
      'text-halo-width': 2.5,
      'text-halo-blur': 1.5
    },
    minzoom: 6
  }
}

/**
 * Couleurs du nuancier Audiar
 */
export const AUDIAR_COLORS = {
  primaryBlue: '#316D7B',
  secondaryBlue: '#4A9AB2',
  accentOrange: '#F17E08',
  lightBlue: 'rgba(49, 109, 123, 0.1)',
  error: '#e74c3c',
  success: '#2ecc71'
}

