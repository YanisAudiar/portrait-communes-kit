import { ref, unref, type Ref } from 'vue'
import { api } from '@/services/api'

/**
 * Gestion centralisée du chargement des informations principales d'une commune.
 * Cette fonction conserve les indicateurs de statut pour simplifier le composant d'affichage.
 *
 * @param {string|Ref<string>} codeInsee - Code INSEE fourni sous forme de chaîne ou de ref.
 */


export function useCommuneData(codeInsee: string | Ref<string>) {
  const loading = ref(true)
  const error = ref<string | null>(null)
  const communeData = ref<any>(null)

  const resolveCodeInsee = (): string => unref(codeInsee)

  /**
   * Charge les données de la commune cible en s'appuyant sur le service API existant.
   * Les erreurs sont normalisées pour éviter les fuites d'implémentation dans la vue.
   */
  const loadCommuneData = async () => {
    const insee = resolveCodeInsee()

    if (!insee) {
      error.value = 'Code INSEE manquant'
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await api.getCommuneByCode(insee)
      communeData.value = response?.properties || response || null
    } catch (err) {
      console.error('❌ Erreur chargement commune:', err)
      error.value = api.handleError(err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    communeData,
    loadCommuneData
  }
}
