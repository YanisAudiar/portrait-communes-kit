/**
 * Fonctions utilitaires pour la carte
 */

/**
 * Détecter si on est sur mobile
 */
export const isMobileDevice = () => window.innerWidth <= 768

/**
 * Détecter si on est sur tablette
 */
export const isTabletDevice = () => window.innerWidth > 768 && window.innerWidth <= 1024

/**
 * Calculer la bounding box d'un GeoJSON
 * Supporte Polygon et MultiPolygon
 */
export const calculateBbox = (geojson) => {
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  
  const processCoordinates = (coords) => {
    if (Array.isArray(coords[0])) {
      coords.forEach(coord => processCoordinates(coord))
    } else {
      // C'est un point [lng, lat]
      const [lng, lat] = coords
      if (!isNaN(lng) && !isNaN(lat)) {
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
      }
    }
  }
  
  geojson.features.forEach(feature => {
    if (feature.geometry && feature.geometry.coordinates) {
      processCoordinates(feature.geometry.coordinates)
    }
  })
  
  // Vérifier que les valeurs sont valides
  if (minLng === Infinity || minLat === Infinity || maxLng === -Infinity || maxLat === -Infinity) {
    console.warn('Bbox invalide calculée, coordonnées non trouvées')
    return null
  }
  
  return [minLng, minLat, maxLng, maxLat]
}

/**
 * Extraire le code INSEE d'une feature
 */
export const getFeatureCode = (feature) => {
  if (!feature || !feature.properties) return ''
  
  return feature.properties.code || 
         feature.properties.code_insee_concat || 
         feature.properties.code_insee ||
         feature.properties.INSEE_COM ||
         feature.properties.id ||
         ''
}

/**
 * Extraire le nom d'une commune d'une feature
 */
export const getFeatureName = (feature) => {
  if (!feature || !feature.properties) return 'Commune'
  
  return feature.properties.nom || 
         feature.properties.NOM ||
         feature.properties.nom_commune ||
         feature.properties.lib_com || 
         feature.properties.name || 
         'Commune'
}

/**
 * Filtrer les features pour ne garder que celles dont le code est dans la liste
 */
export const filterFeaturesByCodes = (geojson, codes) => {
  if (!geojson.features || geojson.features.length === 0) {
    return geojson
  }
  
  return {
    ...geojson,
    features: geojson.features.filter(feature => {
      const code = getFeatureCode(feature)
      return codes.includes(String(code))
    })
  }
}

/**
 * Vérifier si une bounding box est valide
 */
export const isValidBbox = (bbox) => {
  return bbox && 
         Array.isArray(bbox) && 
         bbox.length === 4 && 
         bbox.every(coord => !isNaN(coord))
}

