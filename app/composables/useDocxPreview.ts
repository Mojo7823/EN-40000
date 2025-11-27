/**
 * Composable for DOCX preview rendering and navigation
 */
import { ref, onUnmounted, watch, type Ref } from 'vue'
import { renderAsync } from 'docx-preview'

const DOCX_PAGE_SELECTOR = '.docx-wrapper > section.docx'

export interface DocxPreviewState {
  loading: Ref<boolean>
  error: Ref<string>
  hasGenerated: Ref<boolean>
  zoomLevel: Ref<number>
  currentPage: Ref<number>
  totalPages: Ref<number>
  latestDocPath: Ref<string | null>
}

export interface DocxPreviewActions {
  render: (path: string) => Promise<void>
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  nextPage: () => void
  previousPage: () => void
  scrollToPage: (pageNumber: number) => void
}

export function useDocxPreview(
  containerRef: Ref<HTMLDivElement | null>,
  shellRef: Ref<HTMLDivElement | null>
) {
  const loading = ref(false)
  const error = ref('')
  const hasGenerated = ref(false)
  const zoomLevel = ref(100)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const latestDocPath = ref<string | null>(null)

  // Scroll handler for page tracking
  const updateCurrentPageFromScroll = () => {
    const shell = shellRef.value
    if (!shell) return
    const pages = getRenderedPages()
    if (!pages.length) return
    const midpoint = shell.scrollTop + shell.clientHeight / 2
    let activePage = 1
    pages.forEach((page, index) => {
      if (midpoint >= page.offsetTop) {
        activePage = index + 1
      }
    })
    if (activePage !== currentPage.value) {
      currentPage.value = activePage
      highlightActivePage(activePage)
    }
  }

  // Setup scroll listener
  watch(
    () => shellRef.value,
    (next, previous) => {
      previous?.removeEventListener('scroll', updateCurrentPageFromScroll)
      next?.addEventListener('scroll', updateCurrentPageFromScroll, { passive: true })
    }
  )

  onUnmounted(() => {
    shellRef.value?.removeEventListener('scroll', updateCurrentPageFromScroll)
  })

  function getRenderedPages(): HTMLElement[] {
    const nodes = containerRef.value?.querySelectorAll<HTMLElement>('.docx-rendered-page')
    return nodes ? Array.from(nodes) : []
  }

  function highlightActivePage(pageNumber: number) {
    const pages = getRenderedPages()
    pages.forEach((page, index) => {
      if (index === pageNumber - 1) {
        page.classList.add('is-active')
      } else {
        page.classList.remove('is-active')
      }
    })
  }

  function annotateRenderedPages() {
    if (!containerRef.value) {
      totalPages.value = 1
      currentPage.value = 1
      return
    }
    const rawPages = containerRef.value.querySelectorAll<HTMLElement>(DOCX_PAGE_SELECTOR)
    const pages = Array.from(rawPages)
    if (!pages.length) {
      totalPages.value = 1
      currentPage.value = 1
      return
    }
    pages.forEach((page, index) => {
      page.classList.add('docx-rendered-page')
      page.setAttribute('data-page-label', `Page ${index + 1} / ${pages.length}`)
      page.setAttribute('data-page-number', String(index + 1))
    })
    totalPages.value = pages.length
    currentPage.value = 1
    shellRef.value?.scrollTo({ top: 0 })
    highlightActivePage(1)
    updateCurrentPageFromScroll()
  }

  async function render(path: string) {
    loading.value = true
    error.value = ''
    latestDocPath.value = path

    try {
      const buffer = await $fetch(`http://localhost:8000${path}`, {
        responseType: 'arrayBuffer'
      })

      if (containerRef.value) {
        containerRef.value.innerHTML = ''
        await renderAsync(buffer as ArrayBuffer, containerRef.value, undefined, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true
        })
        hasGenerated.value = true
        requestAnimationFrame(() => {
          annotateRenderedPages()
        })
      }
    } catch (e: any) {
      console.error('DOCX rendering error:', e)
      error.value = 'Failed to render DOCX preview. Please ensure the backend is running.'
    } finally {
      loading.value = false
    }
  }

  function zoomIn() {
    if (zoomLevel.value < 200) {
      zoomLevel.value = Math.min(200, zoomLevel.value + 25)
    }
  }

  function zoomOut() {
    if (zoomLevel.value > 50) {
      zoomLevel.value = Math.max(50, zoomLevel.value - 25)
    }
  }

  function resetZoom() {
    zoomLevel.value = 100
  }

  function scrollToPage(pageNumber: number) {
    const pages = getRenderedPages()
    if (!pages.length) return
    const target = pages[pageNumber - 1]
    const shell = shellRef.value
    if (target && shell) {
      const sectionTop = target.offsetTop
      shell.scrollTo({
        top: sectionTop - 32,
        behavior: 'smooth'
      })
      currentPage.value = pageNumber
      highlightActivePage(pageNumber)
    }
  }

  function nextPage() {
    if (!hasGenerated.value) return
    const next = Math.min(totalPages.value, currentPage.value + 1)
    if (next !== currentPage.value) {
      scrollToPage(next)
    }
  }

  function previousPage() {
    if (!hasGenerated.value) return
    const previous = Math.max(1, currentPage.value - 1)
    if (previous !== currentPage.value) {
      scrollToPage(previous)
    }
  }

  return {
    // State
    loading,
    error,
    hasGenerated,
    zoomLevel,
    currentPage,
    totalPages,
    latestDocPath,
    // Actions
    render,
    zoomIn,
    zoomOut,
    resetZoom,
    nextPage,
    previousPage,
    scrollToPage
  }
}
