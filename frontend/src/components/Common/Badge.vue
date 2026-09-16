<template>
  <span class="badge" :class="[`badge-${variant}`, `badge-${size}`, { 'badge-pulse': pulse }]">
    <slot></slot>
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'error', 'info', 'primary'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  pulse: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 12px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.badge-small {
  padding: 4px 10px;
  font-size: 11px;
  line-height: 1.2;
}

.badge-medium {
  padding: 6px 12px;
  font-size: 12px;
  line-height: 1.3;
}

.badge-large {
  padding: 8px 16px;
  font-size: 13px;
  line-height: 1.4;
}

.badge-default {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
}

.badge-primary {
  background: linear-gradient(135deg, var(--primary-blue) 0%, #2a5a6b 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(49, 109, 123, 0.3);
}

.badge-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.badge-warning {
  background: linear-gradient(135deg, var(--accent-orange) 0%, #d97706 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(241, 126, 8, 0.3);
}

.badge-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.badge-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.badge-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>

