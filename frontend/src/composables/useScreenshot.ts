/**
 * Composable pour les captures d'écran (PNG) des éléments DOM
 * Utilise html-to-image ; logique extraite dans composables/screenshot/
 */
import { ref } from 'vue'
import { toPng, toBlob } from 'html-to-image'
import type { ScreenshotOptions } from './screenshot/screenshotOptions'
import { DEFAULT_HIDE_SELECTORS } from './screenshot/screenshotOptions'
import {
  hideElements,
  restoreElements,
  prepareCanvasForCapture,
  restoreCanvasAfterCapture,
  createCaptureFilter
} from './screenshot/screenshotDom'
import { addWatermarkToImage } from './screenshot/screenshotWatermark'

export type { ScreenshotOptions } from './screenshot/screenshotOptions'

export function useScreenshot() {
  const isCapturing = ref(false)
  const captureError = ref<string | null>(null)
  const captureProgress = ref(0)

  function generateFilename(prefix: string): string {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '')
    return `${prefix}_${dateStr}_${timeStr}.png`
  }

  function downloadDataUrl(dataUrl: string, filename: string): void {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => document.body.removeChild(link), 100)
  }

  async function captureElement(
    element: HTMLElement | string,
    options: ScreenshotOptions = {}
  ): Promise<void> {
    isCapturing.value = true
    captureError.value = null
    captureProgress.value = 0

    try {
      const targetElement =
        typeof element === 'string'
          ? document.querySelector<HTMLElement>(element)
          : element

      if (!targetElement) {
        throw new Error('Élément non trouvé')
      }

      captureProgress.value = 20
      const hideSelectors = options.hideSelectors ?? DEFAULT_HIDE_SELECTORS
      const hiddenElements = hideElements(hideSelectors)
      captureProgress.value = 40

      const devicePixelRatio = window.devicePixelRatio || 1
      const targetPixelRatio =
        options.pixelRatio ?? Math.max(4, Math.ceil(devicePixelRatio * 2))

      const canvasOriginalStyles = prepareCanvasForCapture(targetElement, targetPixelRatio)
      await new Promise((r) => setTimeout(r, 100))

      const captureOptions = {
        quality: options.quality ?? 1,
        pixelRatio: targetPixelRatio,
        backgroundColor: options.backgroundColor ?? '#ffffff',
        cacheBust: true,
        skipFonts: true,
        includeQueryParams: true,
        filter: createCaptureFilter()
      }

      let dataUrl = await toPng(targetElement, captureOptions)
      restoreCanvasAfterCapture(canvasOriginalStyles)
      captureProgress.value = 70
      restoreElements(hiddenElements)

      if (options.addWatermark !== false) {
        dataUrl = await addWatermarkToImage(dataUrl, options.watermarkText)
      }

      captureProgress.value = 90
      const filename = options.filename ?? generateFilename('capture')
      downloadDataUrl(dataUrl, filename)
      captureProgress.value = 100
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la capture d\'écran'
      captureError.value = message
    } finally {
      isCapturing.value = false
      setTimeout(() => {
        captureProgress.value = 0
      }, 1000)
    }
  }

  async function captureChart(chartContainerId: string, options: ScreenshotOptions = {}): Promise<void> {
    await captureElement(`#${chartContainerId}`, options)
  }

  async function captureToBlob(
    element: HTMLElement | string,
    options: ScreenshotOptions = {}
  ): Promise<Blob | null> {
    try {
      const targetElement =
        typeof element === 'string'
          ? document.querySelector<HTMLElement>(element)
          : element
      if (!targetElement) throw new Error('Élément non trouvé')

      const captureOptions = {
        quality: options.quality ?? 0.95,
        pixelRatio: options.pixelRatio ?? 2,
        backgroundColor: options.backgroundColor ?? '#ffffff'
      }
      return await toBlob(targetElement, captureOptions)
    } catch (error: unknown) {
      captureError.value = error instanceof Error ? error.message : 'Erreur capture'
      return null
    }
  }

  return {
    isCapturing,
    captureError,
    captureProgress,
    captureElement,
    captureChart,
    captureToBlob,
    generateFilename
  }
}
