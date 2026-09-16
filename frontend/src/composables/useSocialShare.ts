/**
 * Composable pour gérer le partage sur les réseaux sociaux
 * Support Twitter/X, Facebook, LinkedIn, Email et Web Share API native
 */
import { ref, computed } from 'vue'

// Types
export type SocialNetwork = 'twitter' | 'facebook' | 'linkedin' | 'email'

export interface ShareOptions {
  url?: string
  title?: string
  description?: string
  hashtags?: string[]
}

export interface ShareResult {
  success: boolean
  network: SocialNetwork | 'native'
  error?: string
}

/**
 * Composable pour gérer le partage social
 * @returns Méthodes de partage et états réactifs
 */
export function useSocialShare() {
  const isSharing = ref(false)
  const shareError = ref<string | null>(null)
  const lastShareResult = ref<ShareResult | null>(null)

  /**
   * Vérifie si l'API Web Share native est disponible
   */
  const isNativeShareSupported = computed(() => {
    return typeof navigator !== 'undefined' && 'share' in navigator
  })

  /**
   * Obtient l'URL courante (gère les hash)
   */
  const getCurrentUrl = (): string => {
    return window.location.href
  }

  /**
   * Encode l'URL pour le partage (gère les #)
   */
  const encodeShareUrl = (url: string): string => {
    // Si l'URL contient un hash, le remplacer par %23
    if (url.includes('#')) {
      const parts = url.split('#')
      const base = parts[0] ?? ''
      const hash = parts[1] ?? ''
      return encodeURIComponent(base) + '%23' + encodeURIComponent(hash)
    }
    return encodeURIComponent(url)
  }

  /**
   * Génère l'URL de partage pour chaque réseau
   */
  const getShareUrl = (network: SocialNetwork, options: ShareOptions = {}): string => {
    const url = options.url || getCurrentUrl()
    const title = options.title || document.title
    const description = options.description || ''
    const hashtags = options.hashtags?.join(',') || ''

    switch (network) {
      case 'twitter':
        const twitterParams = new URLSearchParams({
          url,
          text: title,
          ...(hashtags && { hashtags })
        })
        return `https://twitter.com/intent/tweet?${twitterParams.toString()}`

      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

      case 'linkedin':
        const linkedinParams = new URLSearchParams({
          url,
          title,
          summary: description
        })
        return `https://www.linkedin.com/sharing/share-offsite/?${linkedinParams.toString()}`

      case 'email':
        const subject = encodeURIComponent(title)
        const body = encodeURIComponent(`${description}\n\n${url}`)
        return `mailto:?subject=${subject}&body=${body}`

      default:
        return url
    }
  }

  /**
   * Ouvre une fenêtre de partage popup
   */
  const openShareWindow = (url: string, network: SocialNetwork): boolean => {
    const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes'
    const popup = window.open(url, `share-${network}`, windowFeatures)
    
    if (popup) {
      popup.focus()
      return true
    }
    return false
  }

  /**
   * Partage via l'API Web Share native (mobile principalement)
   */
  const shareNative = async (options: ShareOptions = {}): Promise<ShareResult> => {
    if (!isNativeShareSupported.value) {
      return {
        success: false,
        network: 'native',
        error: 'Web Share API non supportée'
      }
    }

    isSharing.value = true
    shareError.value = null

    try {
      await navigator.share({
        url: options.url || getCurrentUrl(),
        title: options.title || document.title,
        text: options.description
      })

      const result: ShareResult = { success: true, network: 'native' }
      lastShareResult.value = result
      return result

    } catch (error: any) {
      // L'utilisateur a annulé le partage (pas une erreur)
      if (error.name === 'AbortError') {
        return { success: false, network: 'native', error: 'Partage annulé' }
      }

      console.error('❌ Erreur partage natif:', error)
      shareError.value = error.message
      return { success: false, network: 'native', error: error.message }

    } finally {
      isSharing.value = false
    }
  }

  /**
   * Partage sur un réseau social spécifique
   */
  const shareToNetwork = (
    network: SocialNetwork,
    options: ShareOptions = {}
  ): ShareResult => {
    isSharing.value = true
    shareError.value = null

    try {
      const shareUrl = getShareUrl(network, options)
      
      // Email est géré différemment (pas de popup)
      if (network === 'email') {
        window.location.href = shareUrl
        const result: ShareResult = { success: true, network }
        lastShareResult.value = result
        return result
      }

      const success = openShareWindow(shareUrl, network)
      
      const result: ShareResult = {
        success,
        network,
        error: success ? undefined : 'Impossible d\'ouvrir la fenêtre de partage'
      }
      
      lastShareResult.value = result
      
      if (!success) {
        shareError.value = result.error || null
      }

      return result

    } catch (error: any) {
      console.error(`❌ Erreur partage ${network}:`, error)
      shareError.value = error.message
      return { success: false, network, error: error.message }

    } finally {
      isSharing.value = false
    }
  }

  /**
   * Copie l'URL dans le presse-papiers
   * Gère le fallback pour les contextes non sécurisés (HTTP)
   */
  const copyToClipboard = async (text?: string): Promise<boolean> => {
    const textToCopy = text || getCurrentUrl()
    
    // 1. Essayer avec l'API moderne navigator.clipboard (HTTPS uniquement)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy)
        return true
      } catch (error: any) {
        console.warn('⚠️ Échec API moderne, tentative fallback...', error)
      }
    }

    // 2. Fallback pour contextes non sécurisés (HTTP)
    try {
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      
      // Assurer que le textarea n'est pas visible
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        return true
      }
      throw new Error('execCommand copy a échoué')
    } catch (error: any) {
      console.error('❌ Erreur copie presse-papiers:', error)
      shareError.value = 'Impossible de copier dans le presse-papiers'
      return false
    }
  }

  /**
   * Raccourcis pour chaque réseau
   */
  const shareToTwitter = (options: ShareOptions = {}) => 
    shareToNetwork('twitter', options)
  
  const shareToFacebook = (options: ShareOptions = {}) => 
    shareToNetwork('facebook', options)
  
  const shareToLinkedIn = (options: ShareOptions = {}) => 
    shareToNetwork('linkedin', options)
  
  const shareByEmail = (options: ShareOptions = {}) => 
    shareToNetwork('email', options)

  return {
    // États
    isSharing,
    shareError,
    lastShareResult,
    isNativeShareSupported,
    
    // Méthodes génériques
    shareToNetwork,
    shareNative,
    copyToClipboard,
    getShareUrl,
    
    // Raccourcis
    shareToTwitter,
    shareToFacebook,
    shareToLinkedIn,
    shareByEmail
  }
}
