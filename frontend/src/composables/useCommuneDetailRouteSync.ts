/**
 * Composable pour synchroniser l'URL avec le thème / sous-thématique
 * de la page CommuneDetail (?thematique=...&sousThematique=...).
 *
 * Extrait de CommuneDetail.vue pour respecter la règle des 200 lignes.
 */
import { ref, watch, type Ref } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import {
  themes,
  getIndicatorsByTheme,
  sortSubthemesByTheme,
  isThemeWithoutData
} from '@/config/indicatorsConfig'

/** Normalise une valeur de query Vue Router (string | string[] | undefined) */
function normalizeQueryString(val: LocationQueryValue | LocationQueryValue[] | undefined): string {
  if (val == null) return ''
  if (Array.isArray(val)) return typeof val[0] === 'string' ? val[0] : ''
  return typeof val === 'string' ? val : ''
}

/** Liste ordonnée des sous-thématiques pour un thème */
function themeSubthemesList(themeId: string): string[] {
  const subthemesList = [...new Set(
    getIndicatorsByTheme(themeId)
      .map((ind: Record<string, unknown>) => ind.subtheme as string)
      .filter(Boolean)
  )]
  return sortSubthemesByTheme(themeId, subthemesList)
}

/**
 * @param routeName - Nom de la route à surveiller (ex. 'commune-detail')
 */
export function useCommuneDetailRouteSync(routeName = 'commune-detail') {
  const route = useRoute()
  const router = useRouter()

  const activeTheme = ref('demographie')
  const selectedSubtheme: Ref<string | null> = ref(null)

  /**
   * Applique la query URL à l'état local (sans toucher à l'URL).
   */
  function applyQueryToState() {
    if (route.name !== routeName) return

    const q = route.query
    const tStr = normalizeQueryString(q.thematique)
    const hasThematiqueInUrl = Boolean(tStr)

    if (hasThematiqueInUrl && (themes as Record<string, unknown>)[tStr]) {
      activeTheme.value = isThemeWithoutData(tStr) ? 'demographie' : tStr
    }

    const subs = themeSubthemesList(activeTheme.value)
    const sStr = normalizeQueryString(q.sousThematique)

    if (subs.length === 0) {
      selectedSubtheme.value = null
      return
    }

    if (sStr && subs.includes(sStr)) {
      selectedSubtheme.value = sStr
    } else if (hasThematiqueInUrl) {
      selectedSubtheme.value = subs[0] ?? null
    } else if (selectedSubtheme.value && !subs.includes(selectedSubtheme.value)) {
      selectedSubtheme.value = subs[0] ?? null
    }
  }

  /** Met à jour l'URL si l'état diffère */
  function syncStateToUrl() {
    if (route.name !== routeName) return

    const nextThematique = activeTheme.value
    const nextSous = selectedSubtheme.value || ''

    const curT = normalizeQueryString(route.query.thematique)
    const curS = normalizeQueryString(route.query.sousThematique)

    if (curT === nextThematique && curS === nextSous) return

    const newQuery: Record<string, string> = { ...route.query as Record<string, string>, thematique: nextThematique }
    if (nextSous) {
      newQuery.sousThematique = nextSous
    } else {
      delete newQuery.sousThematique
    }

    router.replace({ path: route.path, query: newQuery })
  }

  /** Applique la nouvelle thématique sélectionnée depuis le bandeau */
  function handleThemeSelected(themeId: string) {
    activeTheme.value = themeId
    const newSubthemes = themeSubthemesList(themeId)
    selectedSubtheme.value = newSubthemes.length > 0 ? (newSubthemes[0] ?? null) : null
  }

  /** Sélection d'une sous-thématique */
  function onSubthemeSelected(subtheme: string) {
    selectedSubtheme.value = subtheme
  }

  // Lecture initiale de la query
  applyQueryToState()

  // Synchroniser thème / sous-thématique vers l'URL
  watch([activeTheme, selectedSubtheme], () => syncStateToUrl(), { flush: 'post', immediate: true })

  // Navigation interne / retour navigateur : réappliquer la query
  watch(
    () => [route.params.codeInsee, route.query.thematique, route.query.sousThematique],
    () => applyQueryToState()
  )

  return {
    activeTheme,
    selectedSubtheme,
    handleThemeSelected,
    onSubthemeSelected,
    themeSubthemesList
  }
}
