/**
 * Validation des codes INSEE côté client.
 * Même règle que le backend pour éviter la navigation vers des routes invalides.
 */
export const CODE_INSEE_REGEX = /^([0-9]{5}|2[AB][0-9]{3})$/

export function normalizeAndValidateCodeInsee(codeInsee: string): string | null {
  const normalized = codeInsee.trim().toUpperCase()
  if (!CODE_INSEE_REGEX.test(normalized)) {
    return null
  }
  return normalized
}
