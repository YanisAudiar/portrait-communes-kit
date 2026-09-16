/**
 * Lecture d'un GeoJSON communes local (kit agences, sans GeoServer).
 * Propriétés attendues : code_insee_concat, lib_com, geom (Polygon / MultiPolygon).
 */
import fs from 'fs'
import path from 'path'

export interface CommunesFeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: string
    properties: Record<string, unknown>
    geometry: unknown
  }>
}

let cache: { filePath: string; data: CommunesFeatureCollection } | null = null

/** Chemin absolu : tel quel ; sinon relatif au cwd du process (souvent backend/). */
export function resolveCommunesGeojsonPath(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new Error('COMMUNES_GEOJSON_PATH est vide')
  }
  return path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed)
}

export function loadCommunesGeojson(filePath: string): CommunesFeatureCollection {
  const resolved = resolveCommunesGeojsonPath(filePath)
  if (cache && cache.filePath === resolved) {
    return cache.data
  }
  if (!fs.existsSync(resolved)) {
    throw new Error(`Fichier GeoJSON introuvable : ${resolved}`)
  }
  const parsed = JSON.parse(fs.readFileSync(resolved, 'utf8')) as CommunesFeatureCollection
  if (!parsed || parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
    throw new Error(`GeoJSON invalide (FeatureCollection attendue) : ${resolved}`)
  }
  cache = { filePath: resolved, data: parsed }
  return parsed
}

export function filterCommunesGeojson(
  collection: CommunesFeatureCollection,
  options: { codeInsee?: string; maxFeatures?: number; limit?: number } = {}
): CommunesFeatureCollection {
  let features = collection.features
  if (options.codeInsee) {
    features = features.filter((feature) => {
      const props = feature.properties || {}
      const code = String(props.code_insee_concat ?? props.code ?? '')
      return code === options.codeInsee
    })
  }
  const max = options.maxFeatures ?? options.limit
  if (max && features.length > max) {
    features = features.slice(0, max)
  }
  return {
    type: 'FeatureCollection',
    features: features.map((feature) => ({ ...feature, properties: { ...feature.properties } }))
  }
}

export function clearCommunesGeojsonCache(): void {
  cache = null
}
