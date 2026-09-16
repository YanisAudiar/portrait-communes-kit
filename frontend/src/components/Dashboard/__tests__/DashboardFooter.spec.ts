import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardFooter from '../DashboardFooter.vue'
import { siteConfig } from '@/config/site'

describe('DashboardFooter', () => {
  it('affiche l’identité issue de siteConfig', () => {
    const wrapper = mount(DashboardFooter, {
      global: {
        stubs: ['router-link']
      }
    })
    expect(wrapper.text()).toContain(siteConfig.agency.shortName)
    expect(wrapper.text()).toContain(`Développé par ${siteConfig.agency.name}`)
    expect(wrapper.get('.footer-website').attributes('href')).toBe(siteConfig.agency.website)
  })

  it('renders logo', () => {
    const wrapper = mount(DashboardFooter, {
      global: {
        stubs: ['router-link']
      }
    })
    const logo = wrapper.find('.footer-logo-img')
    expect(logo.exists()).toBe(true)
  })

  it('masque la colonne partenaire quand showPartnerColumn est false', () => {
    const wrapper = mount(DashboardFooter, {
      props: { showPartnerColumn: false },
      global: {
        stubs: ['router-link']
      }
    })
    if (siteConfig.partner) {
      expect(wrapper.text()).not.toContain(siteConfig.partner.name)
    }
    expect(wrapper.find('.footer-container--two-cols').exists()).toBe(true)
  })
})
