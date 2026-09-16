import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCommuneStore } from '../communeStore'

// Mock API
vi.mock('@/services/api', () => ({
  api: {
    getCommunesChoropleth: vi.fn(),
    getCommuneByCode: vi.fn(),
    handleError: vi.fn((err) => err)
  }
}))

describe('communeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty state', () => {
    const store = useCommuneStore()
    expect(store.communes).toEqual([])
    expect(store.selectedCommune).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('sets communes correctly', () => {
    const store = useCommuneStore()
    const mockCommunes = [{ properties: { code: '35000', nom: 'Rennes' } }]
    store.setCommunes(mockCommunes)
    expect(store.communes).toEqual(mockCommunes)
    expect(store.communesCount).toBe(1)
  })

  it('selects commune correctly', () => {
    const store = useCommuneStore()
    const mockCommune = { properties: { code: '35000', nom: 'Rennes' } }
    store.selectCommune(mockCommune)
    expect(store.selectedCommune).toEqual(mockCommune)
    expect(store.hasSelectedCommune).toBe(true)
  })

  it('resets state correctly', () => {
    const store = useCommuneStore()
    store.setCommunes([{ properties: { code: '35000' } }])
    store.selectCommune({ properties: { code: '35000' } })
    
    store.reset()
    
    expect(store.communes).toEqual([])
    expect(store.selectedCommune).toBeNull()
  })
})
