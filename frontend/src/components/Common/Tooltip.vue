<template>
  <div class="tooltip-wrapper" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <slot></slot>
    <Transition name="tooltip">
      <div v-if="isVisible" class="tooltip" :class="[`tooltip-${position}`, `tooltip-${size}`]">
        <div class="tooltip-content">
          <slot name="content">{{ text }}</slot>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  delay: {
    type: Number,
    default: 300
  }
})

const isVisible = ref(false)
let timeoutId = null

const showTooltip = () => {
  timeoutId = setTimeout(() => {
    isVisible.value = true
  }, props.delay)
}

const hideTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  isVisible.value = false
}
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  z-index: 1000;
  padding: 8px 12px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
  backdrop-filter: blur(10px);
}

.tooltip-small {
  font-size: 12px;
  padding: 6px 10px;
}

.tooltip-medium {
  font-size: 13px;
  padding: 8px 12px;
}

.tooltip-large {
  font-size: 14px;
  padding: 10px 14px;
  white-space: normal;
  max-width: 250px;
}

.tooltip-top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip-right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.tooltip-top .tooltip-arrow {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0 6px;
  border-color: #1f2937 transparent transparent transparent;
}

.tooltip-bottom .tooltip-arrow {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent #1f2937 transparent;
}

.tooltip-left .tooltip-arrow {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
  border-color: transparent transparent transparent #1f2937;
}

.tooltip-right .tooltip-arrow {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 6px 6px 0;
  border-color: transparent #1f2937 transparent transparent;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.tooltip-top.tooltip-enter-from,
.tooltip-top.tooltip-leave-to {
  transform: translateX(-50%) translateY(4px);
}

.tooltip-left.tooltip-enter-from,
.tooltip-left.tooltip-leave-to {
  transform: translateY(-50%) translateX(4px);
}

.tooltip-right.tooltip-enter-from,
.tooltip-right.tooltip-leave-to {
  transform: translateY(-50%) translateX(-4px);
}
</style>

