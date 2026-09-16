/**
 * Interrupteurs fonctionnels backend, testables.
 * Symétrique de frontend/src/config/featureFlags.ts : les deux doivent rester alignés.
 */

/**
 * Routes PDF (/api/pdf/*) : désactivées par défaut.
 *
 * SÉCURITÉ : l'export PDF n'est pas exposé dans l'interface
 * (ENABLE_PDF_EXPORT = false dans frontend/src/config/featureFlags.ts).
 * Monter ces routes exposerait donc publiquement, sans usage réel :
 *  - un rendu Chromium par requête (150-300 Mo de RAM, ≥ 10 s, jusqu'à 2 min pour ?all=true)
 *    sans limite de concurrence : quelques requêtes parallèles suffisent à épuiser le serveur,
 *    qui tourne en instance unique sous PM2 (l'API de données tomberait avec) ;
 *  - deux endpoints POST de rendu natif (/generate, /preview) jamais appelés par l'UI
 *    et inopérants en l'état (corps attendu > limite globale express.json de 100 Ko).
 *
 * Réactiver avec ENABLE_PDF_ROUTES=true, en même temps que le flag frontend, et
 * seulement après avoir borné la concurrence Puppeteer (cf. docs/AUDIT_SECURITE.md).
 */
export function arePdfRoutesEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.ENABLE_PDF_ROUTES === 'true'
}
