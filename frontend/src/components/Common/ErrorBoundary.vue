<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h3>Une erreur inattendue est survenue</h3>
      <p class="error-message">{{ error.message || 'Erreur inconnue' }}</p>
      <button @click="resetError" class="retry-button">
        Réessayer
      </button>
    </div>
  </div>
  <div v-else style="height: 100%; width: 100%">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

// Capture les erreurs des composants enfants
onErrorCaptured((err, instance, info) => {
  console.error('🚨 Erreur capturée par ErrorBoundary:', { err, info })
  error.value = err
  
  // Retourner false empêche l'erreur de remonter plus haut (et d'atteindre app.config.errorHandler)
  // Ici on laisse remonter pour le logging global si besoin, ou on stop.
  // On va stopper la propagation car on l'affiche ici.
  return false 
})

const resetError = () => {
  error.value = null
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
  background-color: #fdf2f2;
  border-radius: 8px;
  border: 1px solid #f8b4b4;
  margin: 1rem;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h3 {
  color: #9b1c1c;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.error-message {
  color: #c81e1e;
  margin-bottom: 1.5rem;
  font-family: monospace;
  font-size: 0.9rem;
  background: rgba(255,255,255,0.5);
  padding: 0.5rem;
  border-radius: 4px;
}

.retry-button {
  background-color: #e02424;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #c81e1e;
}
</style>

