import { describe, it, expect } from 'vitest'
import { normalizeAndValidateCodeInsee } from '../codeInsee'

describe('codeInsee validation', () => {
  it('accepts valid metropolitan codes', () => {
    expect(normalizeAndValidateCodeInsee('35238')).toBe('35238')
    expect(normalizeAndValidateCodeInsee(' 35238 ')).toBe('35238')
  })

  it('accepts Corsica special codes', () => {
    expect(normalizeAndValidateCodeInsee('2a001')).toBe('2A001')
  })

  it('rejects malicious or invalid codes', () => {
    expect(normalizeAndValidateCodeInsee("35238');alert(1)//")).toBeNull()
    expect(normalizeAndValidateCodeInsee('<script>')).toBeNull()
    expect(normalizeAndValidateCodeInsee('123')).toBeNull()
  })
})
