<template>
  <div v-if="loading" class="loading-overlay glass-dark">
    <div class="loading-content">
      <div class="spinner"></div>
      <p>🔄 {{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Chargement des données...'
  }
})
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 41, 114, 0.95) 0%, rgba(49, 109, 123, 0.95) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-content {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  min-width: 240px;
  animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.spinner {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #f17e08,
    #e36411,
    #1e2972,
    #316d7b,
    #f17e08
  );
  animation: rotate 1.2s linear infinite;
  margin: 0 auto 24px;
  position: relative;
  box-shadow: 0 4px 20px rgba(241, 126, 8, 0.3);
}

.spinner::after {
  content: '';
  position: absolute;
  inset: 8px;
  background: white;
  border-radius: 50%;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.loading-content p {
  margin: 0;
  color: #1e2972;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #1e2972 0%, #f17e08 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Responsive */
@media (max-width: 768px) {
  .loading-overlay {
    padding: 20px;
  }
  
  .loading-content {
    padding: 16px;
    font-size: 14px;
  }
  
  .spinner {
    width: 32px;
    height: 32px;
  }
}
</style>

