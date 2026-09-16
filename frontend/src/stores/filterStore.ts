/**
 * Store pour gérer les filtres de l'application
 * (départements, indicateurs, etc.)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { defaultInseeDepartment } from '@/config/site'

interface Departement {
  code: string
  label: string
}

interface Indicateur {
  code: string
  label: string
  unit: string
  description: string
}

export const useFilterStore = defineStore('filter', () => {
  // Département par défaut = territoire configuré (site.ts)
  const selectedDepartement = ref(defaultInseeDepartment())
  const selectedIndicateur = ref('nb_menages')
  const dataYear = ref<number | null>(null)

  const departements = ref<Departement[]>([
    // Liste Bretagne — à adapter si le territoire n'est pas breton
    { code: 'all', label: 'Toute la Bretagne' },
    { code: '22', label: 'Côtes-d\'Armor (22)' },
    { code: '29', label: 'Finistère (29)' },
    { code: '35', label: 'Ille-et-Vilaine (35)' },
    { code: '56', label: 'Morbihan (56)' }
  ])

  const indicateurs = ref<Indicateur[]>([
    {
      code: 'nb_menages',
      label: 'Nombre de ménages',
      unit: 'ménages',
      description: 'Nombre total de ménages dans la commune'
    },
    {
      code: 'taille_moyenne_menage',
      label: 'Taille moyenne des ménages',
      unit: 'personnes',
      description: 'Nombre moyen de personnes par ménage'
    },
    {
      code: 'part_personnes_seules',
      label: 'Part de personnes seules',
      unit: '%',
      description: 'Pourcentage de ménages composés d\'une seule personne'
    }
  ])

  const currentDepartement = computed(() =>
    departements.value.find(d => d.code === selectedDepartement.value)
  )

  const currentIndicateur = computed(() =>
    indicateurs.value.find(i => i.code === selectedIndicateur.value)
  )

  const isBretagneSelected = computed(() =>
    selectedDepartement.value === 'all'
  )

  function setDepartement(code: string) {
    selectedDepartement.value = code
  }

  function setIndicateur(code: string) {
    selectedIndicateur.value = code
  }

  function setDataYear(year: number | null) {
    dataYear.value = year
  }

  // Cohérence : reset vers le département du territoire configuré
  function resetFilters() {
    selectedDepartement.value = defaultInseeDepartment()
    selectedIndicateur.value = 'nb_menages'
  }

  return {
    selectedDepartement,
    selectedIndicateur,
    dataYear,
    departements,
    indicateurs,
    currentDepartement,
    currentIndicateur,
    isBretagneSelected,
    setDepartement,
    setIndicateur,
    setDataYear,
    resetFilters
  }
})
