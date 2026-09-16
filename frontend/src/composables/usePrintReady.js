/**
 * Composable pour gérer l'état de "prêt" pour l'export PDF
 * Coordonne le chargement de tous les éléments (carte, graphiques)
 */
import { ref, watch } from 'vue'

export function usePrintReady() {
  const isReady = ref(false)
  const chartsReady = ref(0)
  const mapReady = ref(false)
  const expectedCharts = ref(0)

  /**
   * Vérifie si tout est prêt pour l'export PDF
   */
  const checkIfReady = () => {
    const chartsOk = expectedCharts.value === 0 || chartsReady.value >= expectedCharts.value
    
    // On attend la carte ET les graphiques
    if (chartsOk && mapReady.value && !isReady.value) {
      // Délai supplémentaire pour s'assurer que tout est bien rendu dans le DOM
      // C'est crucial pour Puppeteer qui doit "voir" tous les éléments avant de prendre la photo
      setTimeout(() => {
        isReady.value = true
      }, 500) // Délai pour laisser le navigateur finaliser le rendu
    }
  }

  /**
   * Gère le chargement de la carte
   */
  const handleMapReady = () => {
    mapReady.value = true
    checkIfReady()
  }

  /**
   * Gère le chargement d'un graphique
   */
  const handleChartReady = () => {
    chartsReady.value++
    checkIfReady()
  }

  /**
   * Réinitialise l'état
   */
  const reset = () => {
    isReady.value = false
    chartsReady.value = 0
    mapReady.value = false
    expectedCharts.value = 0
  }

  /**
   * Définit le nombre de graphiques attendus
   */
  const setExpectedCharts = (count) => {
    expectedCharts.value = count
    checkIfReady()
  }

  /**
   * Timeout de sécurité pour forcer le ready si la carte ne répond pas
   */
  const setupSafetyTimeout = (timeoutMs = 5000) => {
    setTimeout(() => {
      if (!mapReady.value) {
        console.warn('⚠️ [CommunePrint] Timeout carte: Forçage du rendu PDF sans attendre la carte')
        mapReady.value = true
        checkIfReady()
      }
      
      // Timeout supplémentaire pour forcer le ready même si les graphiques ne sont pas tous chargés
      setTimeout(() => {
        if (!isReady.value) {
          console.warn(`⚠️ [CommunePrint] Timeout global: Forçage du ready (charts=${chartsReady.value}/${expectedCharts.value})`)
          isReady.value = true
        }
      }, 3000) // 3 secondes supplémentaires après le timeout de la carte
    }, timeoutMs)
    
    // Timeout de sécurité absolu : forcer le ready après 15 secondes maximum
    setTimeout(() => {
      if (!isReady.value) {
        console.warn('⚠️ [CommunePrint] Timeout absolu: Forçage du ready après 15 secondes')
        isReady.value = true
      }
    }, 15000)
  }

  return {
    isReady,
    chartsReady,
    mapReady,
    expectedCharts,
    checkIfReady,
    handleMapReady,
    handleChartReady,
    reset,
    setExpectedCharts,
    setupSafetyTimeout
  }
}

