<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h3>ℹ️ Informations</h3>
      <p>Cette application permet de visualiser les communes de Bretagne avec différents niveaux de détail.</p>
      <ul>
        <li><strong>Vue générale :</strong> Affichage simplifié pour une vue d'ensemble</li>
        <li><strong>Vue standard :</strong> Niveau de détail équilibré</li>
        <li><strong>Vue détaillée :</strong> Maximum de précision géographique</li>
      </ul>
      <button @click="$emit('close')" class="modal-btn">
        <span>Fermer</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 560px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-blue), var(--accent-orange));
  border-radius: 16px 16px 0 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content h3 {
  margin: 0 0 24px 0;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-orange) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-content p {
  margin-bottom: 20px;
  line-height: 1.7;
  color: #6b7280;
  font-size: 15px;
}

.modal-content ul {
  margin-bottom: 28px;
  padding-left: 24px;
  list-style: none;
}

.modal-content li {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #374151;
  font-size: 14px;
  position: relative;
  padding-left: 8px;
}

.modal-content li::before {
  content: '▸';
  position: absolute;
  left: -20px;
  color: var(--accent-orange);
  font-weight: bold;
}

.modal-content li strong {
  color: var(--primary-blue);
  font-weight: 600;
}

.modal-btn {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-orange) 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(49, 109, 123, 0.3);
  position: relative;
  overflow: hidden;
}

.modal-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-orange) 0%, var(--primary-blue) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(49, 109, 123, 0.4);
}

.modal-btn:hover::before {
  opacity: 1;
}

.modal-btn span {
  position: relative;
  z-index: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    padding: 16px;
    margin: 16px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
  }
  
  .modal-content h3 {
    font-size: 18px;
  }
  
  .modal-content p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 12px;
    margin: 12px;
  }
  
  .modal-content h3 {
    font-size: 16px;
  }
  
  .modal-content p {
    font-size: 13px;
  }
}
</style>
