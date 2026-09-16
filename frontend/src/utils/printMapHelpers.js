/**
 * Utilitaires pour la génération de cartes SVG pour l'impression
 * Fonctions de projection et conversion GeoJSON vers SVG
 */

/**
 * Dimensions de la carte SVG
 */
export const MAP_DIMENSIONS = {
  width: 800,
  height: 600
}

/**
 * Projection Mercator optimisée et centrée
 * @param {number} lon - Longitude
 * @param {number} lat - Latitude
 * @param {Array<number>} bbox - Bounding box [minLon, minLat, maxLon, maxLat]
 * @returns {{x: number, y: number}} Coordonnées projetées
 */
export const project = (lon, lat, bbox) => {
  const [minLon, minLat, maxLon, maxLat] = bbox

  // Marges internes pour que la carte "respire"
  const padding = 30
  const drawWidth = MAP_DIMENSIONS.width - (padding * 2)
  const drawHeight = MAP_DIMENSIONS.height - (padding * 2)

  // Calcul des échelles
  const lonRange = maxLon - minLon
  const latRange = maxLat - minLat

  // Correction de latitude (Mercator simple)
  const avgLat = (minLat + maxLat) / 2
  const aspectCorrection = 1 / Math.cos(avgLat * Math.PI / 180)

  // Ratio pour faire rentrer la carte sans déformation
  const scaleX = drawWidth / lonRange
  const scaleY = drawHeight / (latRange * aspectCorrection)
  const scale = Math.min(scaleX, scaleY)

  // Centrage
  const xOffset = (MAP_DIMENSIONS.width - (lonRange * scale)) / 2
  const yOffset = (MAP_DIMENSIONS.height - (latRange * aspectCorrection * scale)) / 2

  return {
    x: xOffset + ((lon - minLon) * scale),
    y: MAP_DIMENSIONS.height - (yOffset + ((lat - minLat) * aspectCorrection * scale))
  }
}

/**
 * Convertit une feature GeoJSON en path SVG
 * @param {Object} feature - Feature GeoJSON
 * @param {Array<number>} bbox - Bounding box
 * @returns {string} Path SVG
 */
export const featureToPath = (feature, bbox) => {
  const type = feature.geometry.type
  const coords = feature.geometry.coordinates
  let path = ''

  const processRing = (ring) => {
    let ringPath = ''
    ring.forEach((point, index) => {
      const p = project(point[0], point[1], bbox)
      ringPath += `${index === 0 ? 'M' : 'L'}${p.x},${p.y}`
    })
    ringPath += 'Z'
    return ringPath
  }

  if (type === 'Polygon') {
    coords.forEach(ring => path += processRing(ring) + ' ')
  } else if (type === 'MultiPolygon') {
    coords.forEach(poly => poly.forEach(ring => path += processRing(ring) + ' '))
  }
  return path
}

/**
 * Traite un GeoJSON et retourne les paths SVG
 * @param {Object} geojson - GeoJSON à traiter
 * @param {Function} calculateBbox - Fonction pour calculer le bbox
 * @returns {Array<Object>} Array de paths avec id et d (path SVG)
 */
export const processGeoJsonToPaths = (geojson, calculateBbox) => {
  if (!geojson?.features?.length) {
    return []
  }

  const bbox = calculateBbox(geojson)
  if (!bbox) {
    return []
  }

  return geojson.features.map(feature => ({
    id: feature.properties.code,
    codeConcat: feature.properties.code_insee_concat,
    d: featureToPath(feature, bbox)
  }))
}

