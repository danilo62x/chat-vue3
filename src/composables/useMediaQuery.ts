import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/** `true` enquanto a media query casar. Usada para trocar 3 colunas por painel sobreposto. */
export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(typeof window !== 'undefined' ? window.matchMedia(query).matches : false)
  let mql: MediaQueryList | null = null

  const onChange = (e: MediaQueryListEvent) => {
    matches.value = e.matches
  }

  onMounted(() => {
    mql = window.matchMedia(query)
    matches.value = mql.matches
    mql.addEventListener('change', onChange)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', onChange)
  })

  return matches
}
