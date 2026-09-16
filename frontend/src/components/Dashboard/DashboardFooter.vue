<template>
  <footer class="dashboard-footer">
    <div
      class="footer-container"
      :class="{ 'footer-container--two-cols': !showPartnerColumn || !partner }"
    >
      <div class="footer-column">
        <div class="footer-logo">
          <div class="logo-box">
            <img
              v-if="!logoError"
              src="@/assets/images/logo-Audiar.svg"
              :alt="agency.name"
              class="footer-logo-img"
              @error="handleLogoError"
            />
            <svg v-else width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" fill="var(--primary-blue)" rx="4" />
              <text
                x="12"
                y="28"
                font-family="Montserrat"
                font-weight="700"
                font-size="20"
                fill="white"
              >
                {{ agency.shortName.slice(0, 2) }}
              </text>
            </svg>
          </div>
          <div class="logo-text">
            <div class="logo-title">{{ agency.shortName }}</div>
            <div class="logo-subtitle">{{ agency.placeLabel }}</div>
          </div>
        </div>
        <div class="footer-info">
          <p class="footer-copyright">Développé par {{ agency.name }}</p>
          <p class="footer-copyright">© {{ agency.copyrightProduct }}</p>
        </div>
        <nav class="footer-nav">
          <a
            :href="agency.contactUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link"
          >
            Contactez-nous
          </a>
          <router-link to="/mentions-legales" class="footer-link">Mentions légales</router-link>
          <ManageCookiesLink link-class="footer-link" />
        </nav>
        <div v-if="agency.linkedinUrl" class="footer-social">
          <a
            :href="agency.linkedinUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            aria-label="LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
              />
            </svg>
          </a>
        </div>
      </div>

      <div class="footer-column">
        <h3 class="footer-title">{{ agency.name }}</h3>
        <div class="footer-contact">
          <p class="footer-address">
            <template v-for="(line, index) in agency.addressLines" :key="line">
              {{ line }}<br v-if="index < agency.addressLines.length - 1" />
            </template>
          </p>
          <p class="footer-phone">T. {{ agency.phone }}</p>
          <a
            :href="agency.website"
            class="footer-website"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ agency.websiteLabel }}
          </a>
        </div>
      </div>

      <div v-if="showPartnerColumn && partner" class="footer-column">
        <h3 class="footer-title">{{ partner.name }}</h3>
        <div class="footer-contact">
          <p class="footer-address">
            <template v-for="(line, index) in partner.addressLines" :key="line">
              {{ line }}<br v-if="index < partner.addressLines.length - 1" />
            </template>
          </p>
          <p class="footer-phone">T. {{ partner.phone }}</p>
          <a
            :href="partner.website"
            class="footer-website"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ partner.websiteLabel }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ManageCookiesLink from '@/components/Common/ManageCookiesLink.vue'
import { siteConfig } from '@/config/site'

const agency = siteConfig.agency
const partner = siteConfig.partner

withDefaults(
  defineProps<{
    showPartnerColumn?: boolean
  }>(),
  { showPartnerColumn: true }
)

const logoError = ref<boolean>(false)

const handleLogoError = () => {
  logoError.value = true
}
</script>

<style scoped>
.dashboard-footer {
  background: #dbe7eb;
  color: var(--text-primary);
  padding: 40px 24px;
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  align-items: start;
}

.footer-container--two-cols {
  grid-template-columns: repeat(2, 1fr);
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-box {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-blue);
  line-height: 1.2;
}

.logo-subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.2;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-copyright {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'Roboto', sans-serif;
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.footer-link {
  color: var(--primary-blue);
  text-decoration: none;
  font-size: 13px;
  font-family: 'Roboto', sans-serif;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--accent-orange);
  text-decoration: underline;
}

.footer-social {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.social-link {
  color: var(--text-secondary);
  opacity: 0.6;
  transition: opacity 0.3s ease, color 0.3s ease;
}

.social-link:hover {
  opacity: 1;
  color: var(--primary-blue);
}

.footer-title {
  margin: 0 0 12px 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-blue);
}

.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-address {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'Roboto', sans-serif;
  line-height: 1.6;
}

.footer-phone {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'Roboto', sans-serif;
}

.footer-website {
  color: var(--primary-blue);
  text-decoration: none;
  font-size: 13px;
  font-family: 'Roboto', sans-serif;
  transition: color 0.3s ease;
}

.footer-website:hover {
  color: var(--accent-orange);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-column {
    text-align: center;
  }

  .footer-logo {
    justify-content: center;
  }

  .footer-nav {
    align-items: center;
  }

  .footer-social {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .dashboard-footer {
    padding: 32px 16px;
  }
}
</style>


