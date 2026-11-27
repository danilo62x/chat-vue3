import { watchEffect, onUnmounted, type Ref } from 'vue'

export const APP_TITLE = 'Elo — Chat & Mensageria'

/** Sets the document title to "<title> · Elo — Chat & Mensageria" while mounted. */
export function usePageTitle(title?: Ref<string> | (() => string) | string) {
  const resolve = () =>
    typeof title === 'function' ? title() : typeof title === 'string' ? title : (title?.value ?? '')
  watchEffect(() => {
    const t = resolve()
    document.title = t ? `${t} · ${APP_TITLE}` : APP_TITLE
  })
  onUnmounted(() => {
    document.title = APP_TITLE
  })
}
