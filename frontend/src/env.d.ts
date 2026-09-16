/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_BASE_URL?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_CARTO_API_KEY?: string
  readonly VITE_MATOMO_URL?: string
  readonly VITE_MATOMO_SITE_ID?: string
  /** true = territoire fictif (seed SQL / Docker kit) */
  readonly VITE_USE_SAMPLE_TERRITORY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Déclaration pour les fichiers SVG (importés comme URL par Vite)
declare module '*.svg' {
  const content: string
  export default content
}
