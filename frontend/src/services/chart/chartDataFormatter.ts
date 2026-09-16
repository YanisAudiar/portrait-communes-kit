/**
 * Service pour le formatage des données pour Chart.js
 * Point d'entrée : délègue aux modules format/ (bar, line, pie, utils)
 *
 * MODES : single, multi-explicit, multi-grouped, circular
 * Voir format/index.ts et format/chartFormatUtils.ts pour la logique.
 */
export { formatDataForChart } from './format'
