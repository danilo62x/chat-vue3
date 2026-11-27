import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SearchFilters } from '@/data/types'

/** Painel visível no celular: a lista de conversas ou a thread aberta. */
export type MobilePane = 'list' | 'thread'

const EMPTY_SEARCH = (): SearchFilters => ({
  text: '',
  channelId: 'todos',
  personId: 'todos',
  period: 'todos',
})

export const useComposeStore = defineStore(
  'ch-compose',
  () => {
    /** Rascunho por conversa (`c-2`, `d-1`…), preservado ao trocar de canal. */
    const drafts = ref<Record<string, string>>({})
    /** Rascunho da resposta dentro de uma thread aberta. */
    const threadDrafts = ref<Record<string, string>>({})
    const openThreadId = ref<number | null>(null)
    const editingId = ref<number | null>(null)
    const detailOpen = ref(true)
    const mobilePane = ref<MobilePane>('list')
    const search = ref<SearchFilters>(EMPTY_SEARCH())

    function setDraft(key: string, value: string) {
      drafts.value = { ...drafts.value, [key]: value }
    }
    function clearDraft(key: string) {
      const next = { ...drafts.value }
      delete next[key]
      drafts.value = next
    }
    function draftOf(key: string): string {
      return drafts.value[key] ?? ''
    }

    function setThreadDraft(key: string, value: string) {
      threadDrafts.value = { ...threadDrafts.value, [key]: value }
    }
    function clearThreadDraft(key: string) {
      const next = { ...threadDrafts.value }
      delete next[key]
      threadDrafts.value = next
    }

    function openThread(id: number) {
      openThreadId.value = id
      detailOpen.value = true
    }
    function closeThread() {
      openThreadId.value = null
    }
    function setEditing(id: number | null) {
      editingId.value = id
    }

    function toggleDetail(value?: boolean) {
      detailOpen.value = value !== undefined ? value : !detailOpen.value
    }
    function setMobilePane(pane: MobilePane) {
      mobilePane.value = pane
    }

    function setSearch(patch: Partial<SearchFilters>) {
      search.value = { ...search.value, ...patch }
    }
    function resetSearch() {
      search.value = EMPTY_SEARCH()
    }

    return {
      drafts,
      threadDrafts,
      openThreadId,
      editingId,
      detailOpen,
      mobilePane,
      search,
      setDraft,
      clearDraft,
      draftOf,
      setThreadDraft,
      clearThreadDraft,
      openThread,
      closeThread,
      setEditing,
      toggleDetail,
      setMobilePane,
      setSearch,
      resetSearch,
    }
  },
  {
    persist: {
      key: 'ch-compose',
      pick: ['drafts', 'threadDrafts', 'detailOpen'],
    },
  }
)
