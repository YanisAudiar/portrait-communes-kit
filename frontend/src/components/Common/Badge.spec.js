import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from './Badge.vue'

describe('Badge.vue', () => {
  it('affiche le contenu du slot par défaut', () => {
    const wrapper = mount(Badge, {
      slots: {
        default: 'Test Badge'
      }
    })
    expect(wrapper.text()).toContain('Test Badge')
  })

  it('applique la classe correcte pour la variante', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'success'
      }
    })
    expect(wrapper.classes()).toContain('badge-success')
  })

  it('applique la classe correcte pour la taille', () => {
    const wrapper = mount(Badge, {
      props: {
        size: 'large'
      }
    })
    expect(wrapper.classes()).toContain('badge-large')
  })

  it('applique la classe pulse si la prop est vraie', () => {
    const wrapper = mount(Badge, {
      props: {
        pulse: true
      }
    })
    expect(wrapper.classes()).toContain('badge-pulse')
  })
})

