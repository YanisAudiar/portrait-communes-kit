<template>
  <div v-if="error" class="error">
    ❌ {{ error }}
  </div>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.error {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: white;
  padding: 18px 24px;
  border-radius: 16px;
  z-index: 1000;
  box-shadow: 
    0 8px 24px rgba(220, 38, 38, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .error {
    padding: 12px 16px;
    font-size: 14px;
    margin: 8px;
  }
}
</style>

