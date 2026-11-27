<template>
  <div class="flex h-full min-h-0 gap-3">
    <aside
      :class="`h-full w-full shrink-0 md:block md:w-72 lg:w-80 ${compose.mobilePane === 'list' ? 'block' : 'hidden'}`"
    >
      <ConversationList :active="target" />
    </aside>

    <section :class="`h-full min-w-0 flex-1 md:block ${compose.mobilePane === 'thread' ? 'block' : 'hidden'}`">
      <ChatPanel
        :target="target"
        :first-unread-id="unreadMarker"
        :highlight-id="highlightParentId ?? highlightId"
        @open-thread="compose.openThread($event)"
        @toggle-detail="onToggleDetail"
        @back="compose.setMobilePane('list')"
      />
    </section>

    <!-- Em `xl` a terceira coluna fica fixa ao lado -->
    <aside v-if="isWide && showSide" class="h-full w-80 shrink-0 2xl:w-96">
      <ThreadPanel
        v-if="compose.openThreadId !== null"
        :root-id="compose.openThreadId"
        :highlight-id="highlightParentId ? highlightId : null"
        @close="closeSide"
      />
      <DetailPanel v-else :target="target" @close="closeSide" />
    </aside>

    <!-- Abaixo de `xl` ela vira sobreposição, aberta só por ação explícita -->
    <div
      v-if="!isWide && showSide"
      class="fixed inset-0 z-[70] flex justify-end bg-gray-900/50 backdrop-blur-sm"
      @click="closeSide"
    >
      <div class="h-full w-full max-w-md p-3" @click.stop>
        <ThreadPanel
        v-if="compose.openThreadId !== null"
        :root-id="compose.openThreadId"
        :highlight-id="highlightParentId ? highlightId : null"
        @close="closeSide"
      />
        <DetailPanel v-else :target="target" @close="closeSide" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ChatPanel from '@/components/ch/ChatPanel.vue'
import ConversationList from '@/components/ch/ConversationList.vue'
import DetailPanel from '@/components/ch/DetailPanel.vue'
import ThreadPanel from '@/components/ch/ThreadPanel.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useChatStore } from '@/stores/chat'
import { useComposeStore } from '@/stores/compose'
import {
  channelById,
  channelBySlug,
  conversationOf,
  dmById,
  firstUnreadId,
  messageById,
  personById,
  rootMessages,
} from '@/data/query'
import { convKey, type ConversationRef } from '@/data/types'

/** Canal aberto quando você entra em `/app` sem escolher conversa. */
const DEFAULT_CHANNEL_SLUG = 'produto'

const { t } = useI18n()
const route = useRoute()
const isWide = useMediaQuery('(min-width: 1280px)')
const chat = useChatStore()
const compose = useComposeStore()

const highlightId = computed(() => (route.query.msg ? Number(route.query.msg) : null))

// A lista principal só mostra as raízes. Se a busca aponta pra uma resposta,
// quem tem que destacá-la é a thread — e a lista destaca a raiz dela.
const highlightParentId = computed(() =>
  highlightId.value ? (messageById(chat.messages, highlightId.value)?.parentId ?? null) : null
)

const target = computed<ConversationRef>(() => {
  const slug = route.params.slug as string | undefined
  if (slug) {
    const channel = channelBySlug(chat.channels, slug)
    if (channel) return { kind: 'channel', id: channel.id }
  }
  const id = route.params.id as string | undefined
  if (id) {
    const dm = dmById(chat.dms, Number(id))
    if (dm) return { kind: 'dm', id: dm.id }
  }
  const fallback = channelBySlug(chat.channels, DEFAULT_CHANNEL_SLUG) ?? chat.channels[0]
  return { kind: 'channel', id: fallback?.id ?? 1 }
})

const key = computed(() => convKey(target.value))

const channel = computed(() => (target.value.kind === 'channel' ? channelById(chat.channels, target.value.id) : undefined))
const dm = computed(() => (target.value.kind === 'dm' ? dmById(chat.dms, target.value.id) : undefined))
const person = computed(() => (dm.value ? personById(chat.people, dm.value.personId) : undefined))

usePageTitle(() =>
  channel.value ? `#${channel.value.name}` : (person.value?.name ?? t('appNav.conversations'))
)

// O separador "Novas mensagens" é fixado no momento em que a conversa abre,
// antes de marcá-la como lida — assim ele continua visível na tela.
const unreadMarker = ref<number | null>(null)
const overlayOpen = ref(false)

let readTimer = 0

watch(
  key,
  (k) => {
    const roots = rootMessages(chat.messages, target.value)
    const unread =
      target.value.kind === 'channel'
        ? (channelById(chat.channels, target.value.id)?.unread ?? 0)
        : (dmById(chat.dms, target.value.id)?.unread ?? 0)
    unreadMarker.value = firstUnreadId(roots, unread)
    overlayOpen.value = false

    // Uma thread aberta em outra conversa (vinda da lista de threads) fecha;
    // a que pertence a esta conversa continua aberta.
    if (compose.openThreadId !== null) {
      const root = messageById(chat.messages, compose.openThreadId)
      if (!root || convKey(conversationOf(root)) !== k) compose.closeThread()
    }

    const current = target.value
    window.clearTimeout(readTimer)
    readTimer = window.setTimeout(() => chat.markRead(current), 1200)
  },
  { immediate: true }
)

onUnmounted(() => window.clearTimeout(readTimer))

// Abre a thread da resposta destacada. Declarado depois do watch acima, que é
// quem fecha threads de outra conversa ao trocar de conversa.
watch(
  [highlightParentId, key],
  () => {
    if (highlightParentId.value !== null) compose.openThread(highlightParentId.value)
  },
  { immediate: true }
)

// Ao abrir uma conversa por URL no celular, mostra direto a thread.
watch(
  () => [route.params.slug, route.params.id],
  () => {
    if (route.params.slug || route.params.id) compose.setMobilePane('thread')
  },
  { immediate: true }
)

// Abaixo de `xl` a terceira coluna vira sobreposição e só aparece quando você
// pede: uma thread aberta ou o botão de detalhes. Em `xl` ela fica fixa.
const showSide = computed(
  () => compose.openThreadId !== null || (isWide.value ? compose.detailOpen : overlayOpen.value)
)

function closeSide() {
  if (compose.openThreadId !== null) compose.closeThread()
  else compose.toggleDetail(false)
  overlayOpen.value = false
}

function onToggleDetail() {
  if (compose.openThreadId !== null) {
    compose.closeThread()
    compose.toggleDetail(true)
    overlayOpen.value = true
    return
  }
  if (isWide.value) compose.toggleDetail()
  else overlayOpen.value = !overlayOpen.value
}
</script>
