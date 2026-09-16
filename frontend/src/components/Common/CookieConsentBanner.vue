<template>
  <div
    v-if="bannerVisible"
    id="consent-popup"
    class="consent-popup"
    role="dialog"
    aria-labelledby="consent-popup-title"
    aria-describedby="consent-popup-desc"
  >
    <div class="consent-popup__inner">
      <p id="consent-popup-title" class="consent-popup__title">Cookies et mesure d'audience</p>
      <p id="consent-popup-desc" class="consent-popup__text">
        Ce site utilise Matomo pour mesurer la fréquentation de manière anonyme, afin d'améliorer
        le service. Aucun cookie de suivi n'est déposé sans votre accord.
        <router-link to="/mentions-legales" class="consent-popup__link">En savoir plus</router-link>
      </p>
      <div class="consent-popup__actions">
        <button type="button" class="consent-popup__btn consent-popup__btn--refuse" @click="refuse">
          Refuser
        </button>
        <button type="button" class="consent-popup__btn consent-popup__btn--accept" @click="accept">
          Accepter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCookieConsent } from '@/composables/useCookieConsent'

const { bannerVisible, initBanner, accept, refuse } = useCookieConsent()

onMounted(() => {
  initBanner()
})
</script>

<style scoped>
.consent-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0));
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
}

.consent-popup__inner {
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
}

.consent-popup__title {
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-blue, #1e3a5f);
  flex: 1 1 200px;
}

.consent-popup__text {
  margin: 0;
  flex: 2 1 280px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary, #555);
  font-family: 'Roboto', sans-serif;
}

.consent-popup__link {
  color: var(--primary-blue, #1e3a5f);
  text-decoration: underline;
  white-space: nowrap;
}

.consent-popup__link:hover {
  color: var(--accent-orange, #e67e22);
}

.consent-popup__actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.consent-popup__btn {
  padding: 10px 20px;
  font-size: 13px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s ease, color 0.2s ease;
}

.consent-popup__btn--refuse {
  background: transparent;
  color: var(--text-secondary, #555);
  border-color: rgba(0, 0, 0, 0.2);
}

.consent-popup__btn--refuse:hover {
  background: rgba(0, 0, 0, 0.05);
}

.consent-popup__btn--accept {
  background: var(--primary-blue, #1e3a5f);
  color: #fff;
}

.consent-popup__btn--accept:hover {
  background: var(--accent-orange, #e67e22);
}

@media (max-width: 640px) {
  .consent-popup__inner {
    flex-direction: column;
    align-items: stretch;
  }

  .consent-popup__actions {
    justify-content: stretch;
  }

  .consent-popup__btn {
    flex: 1;
  }
}
</style>
