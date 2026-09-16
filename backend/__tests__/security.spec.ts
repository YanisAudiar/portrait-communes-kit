import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ValidationService } from '../services/validation'
import { createErrorResponse, sanitizeClientPayload } from '../utils/common'
import { isOriginAllowed } from '../utils/corsConfig'
import { arePdfRoutesEnabled } from '../utils/featureFlags'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Security - validation PDF comparatif', () => {
  it('should reject too many communes in comparative PDF', () => {
    const tooManyCodes = ['35238', '35206', '35001', '35002', '35003', '35004']

    expect(() => ValidationService.validateComparativeCodeInsees(tooManyCodes)).toThrow(
      `Maximum ${ValidationService.MAX_COMPARATIVE_COMMUNES} communes`
    )
  })

  it('should accept valid comparative PDF payload', () => {
    const codes = ValidationService.validateComparativeCodeInsees(['35238', '35206'])
    expect(codes).toEqual(['35238', '35206'])
  })
})

describe('Security - error responses', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('should hide internal details in production', () => {
    process.env.NODE_ENV = 'production'
    const response = createErrorResponse(new Error('relation "secret_table" does not exist'), 'Erreur serveur')

    expect(response.message).toBe('Une erreur interne est survenue.')
    expect(response).not.toHaveProperty('details')
  })

  it('should expose details in development', () => {
    process.env.NODE_ENV = 'development'
    const response = createErrorResponse(new Error('SQL syntax error near SELECT'), 'Erreur serveur')

    expect(response.details).toBe('SQL syntax error near SELECT')
  })
})

describe('Security - sanitize client payload', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('should strip _queryErrors in production', () => {
    process.env.NODE_ENV = 'production'
    const payload = sanitizeClientPayload({
      population: 1000,
      _queryErrors: ['vue_demo: column foo does not exist']
    })

    expect(payload).toEqual({ population: 1000 })
    expect(payload).not.toHaveProperty('_queryErrors')
  })

  it('should keep _queryErrors in development', () => {
    process.env.NODE_ENV = 'development'
    const payload = sanitizeClientPayload({
      population: 1000,
      _queryErrors: ['vue_demo: column foo does not exist']
    })

    expect(payload._queryErrors).toHaveLength(1)
  })
})

describe('Security - CORS production rules', () => {
  it('should reject wildcard in production', () => {
    expect(isOriginAllowed('https://evil.example', {
      nodeEnv: 'production',
      corsOrigins: '*'
    })).toBe(false)
  })

  it('should allow configured production origin', () => {
    expect(isOriginAllowed('https://portrait-commune.audiar.org', {
      nodeEnv: 'production',
      corsOrigins: 'https://portrait-commune.audiar.org'
    })).toBe(true)
  })

  it('should allow any origin in development', () => {
    expect(isOriginAllowed('https://evil.example', {
      nodeEnv: 'development',
      corsOrigins: 'https://portrait-commune.audiar.org'
    })).toBe(true)
  })
})

describe('Security - PDF health checks (lightweight)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('pdfController healthCheck should not launch puppeteer', async () => {
    const launchSpy = vi.fn()
    vi.doMock('puppeteer', () => ({
      default: {
        launch: launchSpy,
        version: '24.0.0'
      }
    }))

    const { pdfController } = await import('../controllers/pdfController')
    const json = vi.fn()
    const res = { json } as any

    await pdfController.healthCheck({} as any, res)

    expect(launchSpy).not.toHaveBeenCalled()
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'OK',
      note: expect.stringContaining('sans lancement Chromium')
    }))
  })
})

describe('Security - routes PDF desactivees par defaut', () => {
  it('should keep PDF routes off when ENABLE_PDF_ROUTES is absent', () => {
    expect(arePdfRoutesEnabled({})).toBe(false)
  })

  it('should keep PDF routes off for any value other than the exact string "true"', () => {
    expect(arePdfRoutesEnabled({ ENABLE_PDF_ROUTES: 'false' })).toBe(false)
    expect(arePdfRoutesEnabled({ ENABLE_PDF_ROUTES: '1' })).toBe(false)
    expect(arePdfRoutesEnabled({ ENABLE_PDF_ROUTES: 'TRUE' })).toBe(false)
    expect(arePdfRoutesEnabled({ ENABLE_PDF_ROUTES: '' })).toBe(false)
  })

  it('should enable PDF routes only on explicit opt-in', () => {
    expect(arePdfRoutesEnabled({ ENABLE_PDF_ROUTES: 'true' })).toBe(true)
  })

  it('should stay aligned with the frontend feature flag', () => {
    // L'UI n'expose pas l'export PDF : le backend ne doit pas exposer les routes.
    const frontendFlags = readFileSync(
      resolve(__dirname, '../../frontend/src/config/featureFlags.ts'),
      'utf8'
    )
    const uiExportEnabled = /ENABLE_PDF_EXPORT\s*=\s*true/.test(frontendFlags)

    expect(uiExportEnabled).toBe(false)
    expect(arePdfRoutesEnabled({})).toBe(uiExportEnabled)
  })
})
