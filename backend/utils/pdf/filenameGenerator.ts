/**
 * Génération des noms de fichiers PDF
 * Centralise la logique de création des noms de fichiers
 */

/**
 * Génère un nom de fichier PDF pour une commune
 * @param {string} codeInsee - Code INSEE de la commune
 * @param {string|null} themeId - ID de la thématique (optionnel)
 * @returns {string} Nom de fichier PDF
 */
export const generateCommuneFilename = (codeInsee: string, themeId: string | null): string => {
  const themeName = themeId || 'toutes-thematiques'
  return `commune-${codeInsee}-${themeName}-${Date.now()}.pdf`
}

/**
 * Génère un nom de fichier PDF pour un comparatif de communes
 * @param {number} communeCount - Nombre de communes comparées
 * @returns {string} Nom de fichier PDF
 */
export const generateComparativeFilename = (communeCount: number = 0): string => {
  return `comparatif-communes-${communeCount}-${Date.now()}.pdf`
}


