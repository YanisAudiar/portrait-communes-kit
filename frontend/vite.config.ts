import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // Découpage du bundle en chunks pour éviter un fichier JS unique trop gros (>500KB)
    // Améliore le chargement initial et le cache navigateur
    rollupOptions: {
      output: {
        manualChunks: {
          // Chart.js et ses plugins (~300KB)
          'vendor-chart': [
            'chart.js',
            'chartjs-plugin-datalabels',
            'chartjs-plugin-zoom',
            'chartjs-chart-matrix',
            'chartjs-chart-sankey',
            'chartjs-chart-treemap'
          ],
          // MapLibre GL (~500KB)
          'vendor-map': ['maplibre-gl'],
          // Vue et son écosystème (~150KB)
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          // Utilitaires d'export (~100KB)
          'vendor-export': ['html-to-image', 'xlsx']
        }
      }
    },
    // Augmenter la limite d'avertissement à 600KB (après découpage, les chunks seront plus petits)
    chunkSizeWarningLimit: 600
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        'dist/',
        '*.config.ts',
        'src/main.ts'
      ]
    }
  }
})
