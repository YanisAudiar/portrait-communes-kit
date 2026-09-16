<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <Transition :name="getTransitionName(route)" mode="out-in">
        <ErrorBoundary>
          <component :is="Component" :key="route.path" />
        </ErrorBoundary>
      </Transition>
    </router-view>
    <CookieConsentBanner />
  </div>
</template>

<script setup>
/**
 * App.vue - Composant racine de l'application
 * Intègre les transitions de page et le gestionnaire d'erreurs global
 */
import { useRoute } from 'vue-router'
import ErrorBoundary from '@/components/Common/ErrorBoundary.vue'
import CookieConsentBanner from '@/components/Common/CookieConsentBanner.vue'

const route = useRoute()

const getTransitionName = (route) => {
  if (route.name === 'commune-detail') return 'slide-left'
  if (route.name === 'dashboard') return 'slide-right'
  return 'fade'
}
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Transitions de page */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@media (max-width: 767px) {
  #app {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition-duration: 0.3s;
  }

  .slide-left-enter-from,
  .slide-right-enter-from {
    transform: translateX(20px);
  }

  .slide-left-leave-to,
  .slide-right-leave-to {
    transform: translateX(-20px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: none;
  }
}
</style>
