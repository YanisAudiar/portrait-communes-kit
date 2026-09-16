/**
 * Service pour l'enregistrement des composants Chart.js
 * Centralise l'enregistrement de tous les composants et plugins nécessaires
 */
import {
  Chart,
  ArcElement, LineElement, BarElement, PointElement,
  BarController, DoughnutController, LineController,
  PieController, PolarAreaController, RadarController,
  CategoryScale, LinearScale, RadialLinearScale,
  Filler, Legend, Title, Tooltip
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Import du plugin de valeur centrale pour donuts
import { centerValuePlugin } from './chartCenterPlugin'

/**
 * Enregistre tous les composants Chart.js nécessaires
 */
export function registerChartComponents() {
  Chart.register(
    ArcElement, LineElement, BarElement, PointElement,
    BarController, DoughnutController, LineController,
    PieController, PolarAreaController, RadarController,
    CategoryScale, LinearScale, RadialLinearScale,
    Filler, Legend, Title, Tooltip
  )

  // Enregistrement du plugin datalabels avec désactivation par défaut
  Chart.register(ChartDataLabels)
  // Désactiver le plugin par défaut globalement
  Chart.defaults.plugins.datalabels = {
    display: false
  }

  // Enregistrement du plugin personnalisé pour valeur centrale
  Chart.register(centerValuePlugin)
}

// Enregistrement automatique au chargement du module
registerChartComponents()
