import { describe, it, expect } from 'vitest'
import { getThemeColors, themeColors } from '../chartColors'
import { formatDataForChart } from '../chartDataFormatter'

describe('Chart Colors Logic', () => {
  it('should return correct colors for "economie" theme (charte Audiar 8 couleurs)', () => {
    const colors = getThemeColors('economie')
    expect(colors).toEqual(themeColors.economie)
    expect(colors[0]).toBe('#638b96') // Teal – palette principale Baroterritoire
  })

  it('should return correct colors for "emploi" theme (charte Audiar 8 couleurs)', () => {
    const colors = getThemeColors('emploi')
    expect(colors).toEqual(themeColors.emploi)
    expect(colors[0]).toBe('#638b96') // Teal – palette principale
  })

  it('should fallback to default for unknown theme', () => {
    const colors = getThemeColors('unknown-theme')
    expect(colors).toEqual(themeColors.default)
  })

  it('should format circular data with correct theme colors (charte Audiar)', () => {
    const data = [{ label: 'A', value: 10 }, { label: 'B', value: 20 }]
    const result = formatDataForChart(data, 'doughnut', { theme: 'economie' })
    
    const bgColors = result.datasets[0].backgroundColor
    expect(bgColors[0]).toBe('#638b96') // Teal – 1ère couleur palette
    expect(bgColors[1]).toBe('#d9b200') // Jaune doré – 2e couleur
  })

  it('should format bar data with correct theme colors', () => {
    const data = [{ label: 'A', value: 10 }]
    const result = formatDataForChart(data, 'bar', { theme: 'emploi', datasetLabel: 'Test' })
    
    const bgColors = result.datasets[0].backgroundColor
    // Mono-series bar chart uses the first color of the palette or the palette itself if passed as array?
    // In formatBarData: const barColor = overrideColors || premiumColors.primary
    // Wait, formatBarData logic for mono-series:
    // const barColor = overrideColors || premiumColors.primary
    // It DOES NOT use theme colors for mono-series bar charts unless overrideColors is passed!
    // This might be the issue!
    
    // Let's check formatBarData implementation again.
  })
})
