/**
 * API et helpers pour les appels backend PDF (Puppeteer et PDFKit)
 * Pas d'état Vue : fonctions pures qui retournent des Blob ou lancent des erreurs
 */

/**
 * Retourne l'URL de base de l'API (même logique que api.js)
 */
export function getApiBase(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (import.meta.env.PROD) {
    return '/api'
  }
  return 'http://localhost:5000/api'
}

/**
 * Télécharge un blob en fichier côté client
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.style.display = 'none'
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Vérifie que la réponse est un PDF valide et retourne le blob
 */
async function parsePdfResponse(response: Response): Promise<Blob> {
  if (!response.ok) {
    let errorMessage = `Erreur ${response.status}: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      try {
        const errorText = await response.text()
        if (errorText) errorMessage = errorText
      } catch {
        // ignore
      }
    }
    throw new Error(errorMessage)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/pdf')) {
    if (contentType?.includes('text/html')) {
      throw new Error(`Erreur serveur: La route PDF n'a pas été trouvée (${response.status}). Vérifiez que le backend est correctement configuré.`)
    }
    throw new Error(`Type de contenu inattendu: ${contentType}. Attendu: application/pdf`)
  }

  const blob = await response.blob()
  if (blob.size === 0) {
    throw new Error('Le PDF généré est vide')
  }

  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4))
  if (pdfHeader !== '%PDF') {
    throw new Error(`Le fichier reçu n'est pas un PDF valide. Header reçu: "${pdfHeader}"`)
  }

  return new Blob([arrayBuffer], { type: 'application/pdf' })
}

/**
 * Export PDF thématique (Puppeteer)
 */
export async function fetchThemePdf(apiBase: string, codeInsee: string, themeId: string): Promise<Blob> {
  const url = `${apiBase}/pdf/commune/${codeInsee}/${themeId}`
  const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/pdf' } })
  return parsePdfResponse(response)
}

/**
 * Export PDF toutes thématiques (Puppeteer)
 */
export async function fetchAllThemesPdf(apiBase: string, codeInsee: string, signal?: AbortSignal): Promise<Blob> {
  const url = `${apiBase}/pdf/commune/${codeInsee}?allThemes=true`
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/pdf' },
    signal
  })
  return parsePdfResponse(response)
}

/**
 * Export PDF comparatif (Puppeteer)
 */
export async function fetchComparePdf(apiBase: string, codeInsees: string[], themeId: string = 'all'): Promise<Blob> {
  const response = await fetch(`${apiBase}/pdf/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
    body: JSON.stringify({ codeInsees, themeId })
  })
  return parsePdfResponse(response)
}

/**
 * Génération PDF native (PDFKit) - POST avec body JSON
 */
export async function fetchNativePdf(apiBase: string, body: object): Promise<Blob> {
  const response = await fetch(`${apiBase}/pdf/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = `Erreur ${response.status}: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // ignore
    }
    throw new Error(errorMessage)
  }

  const blob = await response.blob()
  if (blob.size === 0) {
    throw new Error('Le PDF généré est vide')
  }
  return blob
}

/**
 * Health check service PDF natif
 */
export async function checkNativePdfHealth(apiBase: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiBase}/pdf/native/health`)
    const data = await response.json()
    return data.status === 'OK'
  } catch {
    return false
  }
}

/**
 * Health check service PDF legacy (Puppeteer)
 */
export async function checkPdfHealth(apiBase: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiBase}/pdf/health`)
    const data = await response.json()
    return data.status === 'OK'
  } catch {
    return false
  }
}
