import { ref, reactive, onMounted, onUnmounted, watch, nextTick, type Ref } from 'vue'

const hexToRgbString = (hex: string): string => {
  if (!hex) return '241, 126, 8'
  let sanitized = hex.replace('#', '')
  if (sanitized.length === 3) {
    sanitized = sanitized.split('').map((char) => `${char}${char}`).join('')
  }
  const bigint = parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `${r}, ${g}, ${b}`
}

interface UseIndicatorsListProps {
  activeThemeId?: string | null
  [key: string]: any
}

interface UseIndicatorsListOptions {
  emitActiveThemeChanged: (themeId: string) => void
}

export const useIndicatorsList = (props: UseIndicatorsListProps, { emitActiveThemeChanged }: UseIndicatorsListOptions) => {
  const listContainer = ref<HTMLElement | null>(null)
  const hoveredIndicatorId = ref<string | null>(null)
  const currentActiveTheme = ref<string | null>(null)
  const scrollThumbHeight = ref<number>(20)
  const scrollThumbPosition = ref<number>(0)
  const activeSubthemes = reactive<Record<string, string | null>>({})

  const updateScrollThumb = (scrollTop: number, scrollHeight: number, clientHeight: number) => {
    const thumbHeight = (clientHeight / scrollHeight) * 100
    scrollThumbHeight.value = Math.max(thumbHeight, 5)

    const scrollableHeight = scrollHeight - clientHeight
    const scrollPercentage = scrollTop / scrollableHeight || 0
    const maxThumbPosition = clientHeight - clientHeight * (scrollThumbHeight.value / 100)
    scrollThumbPosition.value = scrollPercentage * maxThumbPosition
  }

  const updateGroupActiveSubtheme = (groupElement: Element, containerRect: DOMRect) => {
    if (!groupElement) return

    const themeId = groupElement.getAttribute('data-theme-id')
    if (!themeId) return

    const indicatorElements = groupElement.querySelectorAll('.indicator-item')
    if (!indicatorElements.length) return

    let visibleSubtheme: string | null = null

    for (const indicatorElement of Array.from(indicatorElements)) {
      const indicatorRect = indicatorElement.getBoundingClientRect()
      const isVisible =
        indicatorRect.bottom > containerRect.top + 12 &&
        indicatorRect.top < containerRect.bottom - 12

      if (isVisible) {
        visibleSubtheme = indicatorElement.getAttribute('data-subtheme')
        break
      }
    }

    if (!visibleSubtheme) {
      const firstEl = indicatorElements[0]
      if (firstEl) visibleSubtheme = firstEl.getAttribute('data-subtheme')
    }

    if (visibleSubtheme !== activeSubthemes[themeId]) {
      activeSubthemes[themeId] = visibleSubtheme
    }
  }

  const detectActiveTheme = () => {
    if (!listContainer.value) return

    const container = listContainer.value
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    const containerRect = container.getBoundingClientRect()

    updateScrollThumb(scrollTop, scrollHeight, clientHeight)

    const themeGroups = container.querySelectorAll('.theme-group')
    let activeTheme: string | null = null
    let closestDistance = Infinity

    themeGroups.forEach((group) => {
      const rect = group.getBoundingClientRect()
      const distance = Math.abs(rect.top - containerRect.top)

      if (
        rect.top < containerRect.bottom &&
        rect.bottom > containerRect.top &&
        distance < closestDistance
      ) {
        closestDistance = distance
        activeTheme = group.getAttribute('data-theme-id')
      }

      updateGroupActiveSubtheme(group, containerRect)
    })

    if (activeTheme && activeTheme !== currentActiveTheme.value) {
      currentActiveTheme.value = activeTheme
      emitActiveThemeChanged(activeTheme)
    }
  }

  const handleScroll = () => {
    detectActiveTheme()
  }

  const initialiseActiveTheme = () => {
    if (!listContainer.value) return

    const container = listContainer.value
    const firstThemeGroup = container.querySelector('.theme-group')
    if (firstThemeGroup) {
      const firstThemeId = firstThemeGroup.getAttribute('data-theme-id')
      if (firstThemeId) {
        currentActiveTheme.value = firstThemeId
        emitActiveThemeChanged(firstThemeId)
      }
    }

    detectActiveTheme()
  }

  const scrollToIndicator = (indicatorId: string) => {
    if (!listContainer.value) return

    const indicatorElement = listContainer.value.querySelector(
      `[data-indicator-id="${indicatorId}"]`
    )

    if (indicatorElement) {
      indicatorElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const scrollToTheme = (themeId: string) => {
    if (!listContainer.value) return

    const themeElement = listContainer.value.querySelector(
      `[data-theme-id="${themeId}"]`
    )

    if (themeElement) {
      const element = themeElement as HTMLElement
      const topOffset = element.offsetTop - 12
      listContainer.value.scrollTo({
        top: topOffset >= 0 ? topOffset : 0,
        behavior: 'smooth'
      })

      if (currentActiveTheme.value !== themeId) {
        currentActiveTheme.value = themeId
        emitActiveThemeChanged(themeId)
      }
    }
  }

  onMounted(() => {
    if (!listContainer.value) return

    const onResize = () => detectActiveTheme()

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => onResize())
      resizeObserver.observe(listContainer.value)

      onUnmounted(() => {
        resizeObserver.disconnect()
      })
    } else {
      window.addEventListener('resize', onResize)
      onUnmounted(() => {
        window.removeEventListener('resize', onResize)
      })
    }

    setTimeout(() => {
      initialiseActiveTheme()
    }, 100)
  })

  watch(
    () => props.activeThemeId,
    async (newThemeId) => {
      if (!newThemeId || !listContainer.value) return
      await nextTick()
      const container = listContainer.value
      const containerRect = container.getBoundingClientRect()
      const themeElement = container.querySelector(`[data-theme-id="${newThemeId}"]`)
      if (themeElement) {
        updateGroupActiveSubtheme(themeElement, containerRect)
      }
    }
  )

  return {
    listContainer,
    hoveredIndicatorId,
    currentActiveTheme,
    scrollThumbHeight,
    scrollThumbPosition,
    activeSubthemes,
    handleScroll,
    scrollToIndicator,
    scrollToTheme,
    hexToRgbString
  }
}


