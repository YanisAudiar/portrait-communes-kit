import { describe, it, expect, vi } from 'vitest'
import { createClickPopupElement, createHoverPopupElement } from '../mapPopupDom'

describe('mapPopupDom - XSS prevention', () => {
  it('should not execute script payloads in click popup content', () => {
    const onNavigate = vi.fn()
    const maliciousName = '<img src=x onerror=alert(1)>'
    const maliciousCode = "35238');alert(1)//"

    const element = createClickPopupElement(maliciousName, maliciousCode, onNavigate)

    expect(element.querySelector('.popup-title')?.textContent).toBe(maliciousName)
    expect(element.querySelector('.popup-code')?.textContent).toBe(maliciousCode)
    expect(element.querySelector('script')).toBeNull()
    expect(element.querySelector('button')?.getAttribute('onclick')).toBeNull()
    expect(element.querySelector('img')).toBeNull()
  })

  it('should call onNavigate via event listener, not inline handler', () => {
    const onNavigate = vi.fn()
    const element = createClickPopupElement('Rennes', '35238', onNavigate)

    element.querySelector('button')?.click()
    expect(onNavigate).toHaveBeenCalledWith('35238')
  })

  it('should escape hover popup content as text', () => {
    const maliciousName = '<script>alert(1)</script>'
    const element = createHoverPopupElement(maliciousName)

    expect(element.querySelector('strong')?.textContent).toBe(maliciousName)
    expect(element.innerHTML).not.toContain('<script>')
  })
})
