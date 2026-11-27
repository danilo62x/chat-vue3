<template>
  <div class="surface-card flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border">
    <!-- Cabeçalho -->
    <header class="flex items-center gap-3 border-b border-themed px-3 py-3 md:px-5">
      <button
        type="button"
        :aria-label="t('common.back')"
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-themed text-muted md:hidden"
        @click="emit('back')"
      >
        <ChIcon name="arrow-left" :size="16" />
      </button>

      <span
        v-if="channel"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
      >
        <ChIcon :name="channel.private ? 'lock' : 'hash'" :size="18" />
      </span>
      <PersonAvatar
        v-else-if="person"
        :src="person.avatar"
        :name="person.name"
        :presence="person.presence"
        size="md"
      />

      <div class="min-w-0 flex-1">
        <h1 class="truncate text-sm font-semibold text-heading md:text-base">{{ title }}</h1>
        <p class="truncate text-xs text-muted">{{ subtitle }}</p>
      </div>

      <div v-if="memberIds.length > 0" class="hidden -space-x-2 lg:flex">
        <template v-for="id in memberIds.slice(0, 4)" :key="id">
          <img
            v-if="personById(chat.people, id)"
            :src="personById(chat.people, id)!.avatar"
            :alt="personById(chat.people, id)!.name"
            :title="personById(chat.people, id)!.name"
            class="h-7 w-7 rounded-full object-cover ring-2"
            :style="{ '--tw-ring-color': 'var(--tx-card-bg)' }"
          />
        </template>
        <span
          v-if="memberIds.length > 4"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700 ring-2 dark:bg-gray-700 dark:text-gray-200"
          :style="{ '--tw-ring-color': 'var(--tx-card-bg)' }"
        >
          +{{ memberIds.length - 4 }}
        </span>
      </div>

      <div class="flex items-center gap-1">
        <button
          v-for="action in headerActions"
          :key="action.icon"
          type="button"
          :title="action.label"
          :aria-label="action.label"
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-themed text-muted transition hover:text-brand-500"
          @click="action.onClick()"
        >
          <ChIcon :name="action.icon" :size="16" />
        </button>
      </div>
    </header>

    <MessageList
      :messages="list"
      :first-unread-id="firstUnreadId"
      :conversation-key="key"
      :highlight-id="highlightId"
      @open-thread="emit('openThread', $event)"
      @open-image="lightbox = $event"
    >
      <template #empty>
        <EmptyState icon="message-circle" :title="t('chat.emptyTitle')" :description="t('chat.emptyDesc')" />
      </template>
    </MessageList>

    <TypingIndicator :conversation-key="key" />

    <Composer
      :target="target"
      :value="draft"
      :placeholder="placeholder"
      @update:value="compose.setDraft(key, $event)"
      @clear="compose.clearDraft(key)"
    />

    <ModalBase :open="lightbox !== null" :title="lightbox?.name" size="xl" @close="lightbox = null">
      <img v-if="lightbox" :src="lightbox.url" :alt="lightbox.name" class="w-full rounded-xl object-cover" />
    </ModalBase>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import Composer from './Composer.vue'
import MessageList from './MessageList.vue'
import TypingIndicator from './TypingIndicator.vue'
import PersonAvatar from './PersonAvatar.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { useComposeStore } from '@/stores/compose'
import { channelById, dmById, personById, rootMessages } from '@/data/query'
import { convKey, type Attachment, type ConversationRef } from '@/data/types'

/** Coluna central: cabeçalho da conversa, timeline, "digitando" e escrita. */
const props = withDefaults(
  defineProps<{
    target: ConversationRef
    firstUnreadId: number | null
    highlightId?: number | null
  }>(),
  { highlightId: null }
)

const emit = defineEmits<{
  openThread: [id: number]
  toggleDetail: []
  back: []
}>()

const { t } = useI18n()
const router = useRouter()
const { relative } = useChatTime()
const chat = useChatStore()
const compose = useComposeStore()

const lightbox = ref<Attachment | null>(null)

const key = computed(() => convKey(props.target))
const draft = computed(() => compose.drafts[key.value] ?? '')

const channel = computed(() =>
  props.target.kind === 'channel' ? channelById(chat.channels, props.target.id) : undefined
)
const dm = computed(() => (props.target.kind === 'dm' ? dmById(chat.dms, props.target.id) : undefined))
const person = computed(() => (dm.value ? personById(chat.people, dm.value.personId) : undefined))

const list = computed(() => rootMessages(chat.messages, props.target))
const memberIds = computed(() => channel.value?.memberIds ?? [])
const title = computed(() => (channel.value ? channel.value.name : (person.value?.name ?? '—')))

const subtitle = computed(() => {
  if (channel.value) return channel.value.topic
  if (person.value) {
    return `${t(`presence.${person.value.presence}`)} · ${t('chat.lastSeen', { when: relative(person.value.lastSeenAt) })}`
  }
  return ''
})

const placeholder = computed(() =>
  channel.value
    ? t('chat.messageChannel', { name: channel.value.name })
    : t('chat.messagePerson', { name: person.value?.name ?? '' })
)

function startCall(kind: 'voz' | 'video') {
  const query: Record<string, string> = { iniciar: kind }
  if (channel.value) query.canal = String(channel.value.id)
  if (dm.value) query.pessoa = String(dm.value.personId)
  router.push({ path: '/app/chamadas', query })
}

const headerActions = computed(() => [
  { icon: 'phone', label: t('chat.voiceCall'), onClick: () => startCall('voz') },
  { icon: 'video', label: t('chat.videoCall'), onClick: () => startCall('video') },
  { icon: 'search', label: t('appNav.search'), onClick: () => router.push('/app/busca') },
  { icon: 'info', label: t('detail.title'), onClick: () => emit('toggleDetail') },
])
</script>
