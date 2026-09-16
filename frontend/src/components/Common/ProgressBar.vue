<template>
  <div class="progress-bar-container">
    <div class="progress-bar-label" v-if="label">
      <span>{{ label }}</span>
      <span v-if="showValue" class="progress-value">{{ value }}%</span>
    </div>
    <div class="progress-bar-wrapper">
      <div 
        class="progress-bar" 
        :class="[`progress-${variant}`]"
        :style="{ width: `${value}%` }"
      >
        <div class="progress-bar-shine"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  label: {
    type: String,
    default: ''
  },
  showValue: {
    type: Boolean,
    default: true
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'error'].includes(value)
  }
})
</script>

<style scoped>
.progress-bar-container {
  width: 100%;
}

.progress-bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.progress-value {
  color: var(--primary-blue);
  font-weight: 600;
}

.progress-bar-wrapper {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  border-radius: 10px;
  position: relative;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.progress-bar-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.progress-primary {
  background: linear-gradient(90deg, var(--primary-blue), var(--accent-orange));
  box-shadow: 0 0 10px rgba(49, 109, 123, 0.3);
}

.progress-success {
  background: linear-gradient(90deg, #10b981, #059669);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.progress-warning {
  background: linear-gradient(90deg, var(--accent-orange), #d97706);
  box-shadow: 0 0 10px rgba(241, 126, 8, 0.3);
}

.progress-error {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}
</style>

