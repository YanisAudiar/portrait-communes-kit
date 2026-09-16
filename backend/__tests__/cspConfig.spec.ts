import { describe, it, expect } from 'vitest'
import { buildCspDirectives } from '../utils/cspConfig'

describe('CSP - pas d’hôtes Audiar par défaut', () => {
  it('n’inclut pas geoserver.audiar.org ni matomo Audiar sans configuration', () => {
    const directives = buildCspDirectives({})
    const connect = directives.connectSrc.join(' ')
    const script = directives.scriptSrc.join(' ')

    expect(connect).not.toContain('audiar.org')
    expect(connect).not.toContain('audiar.matomo.cloud')
    expect(script).not.toContain('audiar')
  })

  it('ajoute l’origine de GEOSERVER_URL dans connect-src', () => {
    const directives = buildCspDirectives({
      GEOSERVER_URL: 'https://geoserver.agence.test/geoserver/ows'
    })
    expect(directives.connectSrc).toContain('https://geoserver.agence.test')
  })

  it('ajoute les hôtes CSP_CONNECT_SRC et CSP_SCRIPT_SRC', () => {
    const directives = buildCspDirectives({
      CSP_CONNECT_SRC: 'https://stats.example.org,https://tiles.example.org',
      CSP_SCRIPT_SRC: 'https://cdn.matomo.cloud'
    })
    expect(directives.connectSrc).toContain('https://stats.example.org')
    expect(directives.connectSrc).toContain('https://tiles.example.org')
    expect(directives.scriptSrc).toContain('https://cdn.matomo.cloud')
  })
})
