/**
 * Configuration de base commune à tous les presets Chart.js
 */
import { DEFAULT_DATALABELS_CONFIG } from '../chartConstants'

export const baseConfig = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0
  },
  plugins: {
    datalabels: {
      ...DEFAULT_DATALABELS_CONFIG
    }
  }
}
