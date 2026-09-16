/**
 * Watermark (logo agence, date, mention) pour les captures PNG
 */
import audiarLogoSvg from '@/assets/icons/audiar-logo.svg'
import { siteConfig } from '@/config/site'

/**
 * Charge le logo de l'agence (fichier à remplacer dans assets) et retourne une Image
 */
export function loadAudiarLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const logoImg = new Image()
    logoImg.crossOrigin = 'anonymous'
    logoImg.onload = () => resolve(logoImg)
    logoImg.onerror = () => {
      console.warn('⚠️ Impossible de charger le logo agence')
      resolve(null)
    }
    logoImg.src = audiarLogoSvg
  })
}

/**
 * Ajoute un watermark (logo + date + mention) en bas de l'image
 */
export function addWatermarkToImage(dataUrl: string, text?: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(dataUrl)
          return
        }

        const watermarkHeight = 120
        canvas.width = img.width
        canvas.height = img.height + watermarkHeight

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        ctx.fillStyle = '#f8f9fa'
        ctx.fillRect(0, img.height, canvas.width, watermarkHeight)
        ctx.strokeStyle = '#d0d0d0'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, img.height)
        ctx.lineTo(canvas.width, img.height)
        ctx.stroke()

        const contentY = img.height + 20
        const logoHeight = 70
        const logoImg = await loadAudiarLogo()
        let logoWidth = 0

        if (logoImg) {
          logoWidth = logoHeight * (logoImg.width / logoImg.height)
          ctx.drawImage(logoImg, 25, contentY, logoWidth, logoHeight)
        } else {
          ctx.fillStyle = '#1e2972'
          ctx.font = 'bold 32px Inter, Arial, sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText(siteConfig.agency.shortName, 25, contentY + 45)
          logoWidth = ctx.measureText(siteConfig.agency.shortName).width
        }

        const textStartX = 25 + logoWidth + 30
        const now = new Date()
        const dateStr = now.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        ctx.fillStyle = '#555555'
        ctx.font = '20px Inter, Arial, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`Date d'impression : ${dateStr}`, textStartX, contentY + 30)

        ctx.fillStyle = '#1e2972'
        ctx.font = 'bold 24px Inter, Arial, sans-serif'
        ctx.fillText(`Production de ${siteConfig.agency.name}`, textStartX, contentY + 62)

        if (text) {
          ctx.fillStyle = '#666666'
          ctx.font = 'italic 18px Inter, Arial, sans-serif'
          ctx.textAlign = 'right'
          ctx.fillText(text, canvas.width - 25, contentY + 62)
        }

        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        console.error('❌ Erreur ajout watermark:', error)
        resolve(dataUrl)
      }
    }

    img.onerror = () => {
      console.error('❌ Erreur chargement image pour watermark')
      resolve(dataUrl)
    }
    img.src = dataUrl
  })
}
