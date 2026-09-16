/**
 * Configuration complète de tous les indicateurs de l'application
 * Organisés par thématiques avec métadonnées complètes
 * 
 * REFACTORISÉ : La configuration est maintenant modulaire dans le dossier indicators/
 * Ce fichier réexporte tout pour maintenir la compatibilité avec le code existant
 */

// Réexport depuis la nouvelle structure modulaire
export {
  themes,
  indicators,
  getIndicatorsByTheme,
  getSubthemesByTheme,
  getIndicatorByCode,
  getIndicatorById,
  getIndicatorsGroupedByTheme,
  sortSubthemesByTheme,
  isThemeWithoutData,
  THEME_IDS_WITHOUT_DATA
} from './indicators/index'
