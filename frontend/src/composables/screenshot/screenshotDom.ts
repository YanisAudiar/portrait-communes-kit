/**
 * Manipulation du DOM pour la capture : masquer/restaurer éléments, préparer les canvas Chart.js
 */

/**
 * Masque temporairement des éléments pendant la capture
 */
export function hideElements(selectors: string[]): Map<HTMLElement, string> {
  const originalStyles = new Map<HTMLElement, string>()
  selectors.forEach(selector => {
    const elements = document.querySelectorAll<HTMLElement>(selector)
    elements.forEach(el => {
      originalStyles.set(el, el.style.display)
      el.style.display = 'none'
    })
  })
  return originalStyles
}

/**
 * Restaure les éléments masqués
 */
export function restoreElements(originalStyles: Map<HTMLElement, string>): void {
  originalStyles.forEach((display, element) => {
    element.style.display = display
  })
}

/**
 * Prépare les canvas Chart.js pour une capture haute résolution
 */
export function prepareCanvasForCapture(
  container: HTMLElement,
  pixelRatio: number
): Map<HTMLCanvasElement, { width: string; height: string }> {
  const originalStyles = new Map<HTMLCanvasElement, { width: string; height: string }>()
  const canvases = container.querySelectorAll<HTMLCanvasElement>('canvas')

  canvases.forEach(canvas => {
    originalStyles.set(canvas, {
      width: canvas.style.width,
      height: canvas.style.height
    })
    const rect = canvas.getBoundingClientRect()
    const targetWidth = Math.floor(rect.width * pixelRatio)
    const targetHeight = Math.floor(rect.height * pixelRatio)
    const chartInstance = (canvas as any).__chartjs_instance__ || (window as any).Chart?.getChart?.(canvas)
    if (chartInstance) {
      chartInstance.resize(targetWidth, targetHeight)
    }
  })
  return originalStyles
}

/**
 * Restaure les canvas après la capture
 */
export function restoreCanvasAfterCapture(
  originalStyles: Map<HTMLCanvasElement, { width: string; height: string }>
): void {
  originalStyles.forEach((styles, canvas) => {
    canvas.style.width = styles.width
    canvas.style.height = styles.height
    const chartInstance = (canvas as any).__chartjs_instance__ || (window as any).Chart?.getChart?.(canvas)
    if (chartInstance) {
      chartInstance.resize()
    }
  })
}

/**
 * Filtre pour html-to-image : exclut iframes, scripts, polices externes
 */
export function createCaptureFilter(): (node: HTMLElement) => boolean {
  return (node: HTMLElement) => {
    if (!node?.tagName) return true
    const tagName = node.tagName.toLowerCase()
    if (tagName === 'iframe' || tagName === 'script' || tagName === 'noscript') return false
    if (tagName === 'link') {
      const href = (node as HTMLLinkElement).href || ''
      if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) return false
    }
    return true
  }
}
