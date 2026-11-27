<template>
  <div
    v-if="!root"
    class="surface-card flex h-full items-center justify-center rounded-2xl border p-6 text-sm text-muted"
  >
    {{ t('chat.threadGone') }}
  </div>

  <div v-else class="surface-card flex h-full flex-col overflow-hidden rounded-2xl border">
    <div class="flex items-center justify-between border-b border-themed px-4 py-3.5">
      <div class="min-w-0">
        <h2 class="text-sm font-semibold text-heading">{{ t('chat.thread') }}</h2>
        <p class="truncate text-xs text-muted">
          {{ conversationLabel(target!, chat.channels, chat.dms, chat.people) }}
        </p>
      </div>
      <button
        type="button"
        :aria-label="t('common.close')"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:text-heading"
        @click="emit('close')"
      >
        <ChIcon name="x" :size="16" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-3 py-4">
      <div class="rounded-xl border border-themed p-2">
        <MessageBlock
          :group="{ authorId: root.authorId, startedAt: root.createdAt, messages: [root] }"
          variant="thread"
        />
      </div>

      <div class="my-3 flex items-center gap-3">
        <span class="h-px flex-1 bg-[var(--tx-border)]" />
        <span class="text-[11px] font-medium text-muted">{{ plural('chat.replyCount', replies.length) }}</span>
        <span class="h-px flex-1 bg-[var(--tx-border)]" />
      </div>

      <div class="space-y-4">
        <template v-for="item in timeline" :key="item.key">
          <MessageBlock v-if="item.type === 'group'" :group="item.group" variant="thread" :highlight-id="highlightId" />
        </template>
        <p v-if="replies.length === 0" class="py-6 text-center text-xs text-muted">{{ t('chat.noReplies') }}</p>
      </div>
    </div>

    <Composer
      :target="target!"
      :parent-id="rootId"
      :value="value"
      :placeholder="t('chat.replyPlaceholder')"
      @update:value="compose.setThreadDraft(draftKey, $event)"
      @clear="compose.clearThreadDraft(draftKey)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import Composer from './Composer.vue'
import MessageBlock from './MessageBlock.vue'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { useComposeStore } from '@/stores/compose'
import { buildTimeline, conversationLabel, conversationOf, messageById, repliesOf } from '@/data/query'

/** Terceira coluna quando uma thread está aberta: raiz + respostas + resposta. */
const props = withDefaults(defineProps<{ rootId: number; highlightId?: number | null }>(), {
  /** Resposta a destacar quando a thread foi aberta por um resultado de busca. */
  highlightId: null,
})
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const { plural } = useChatTime()
const chat = useChatStore()
const compose = useComposeStore()

const draftKey = computed(() => `t-${props.rootId}`)
const value = computed(() => compose.threadDrafts[draftKey.value] ?? '')

const root = computed(() => messageById(chat.messages, props.rootId))
const target = computed(() => (root.value ? conversationOf(root.value) : undefined))
const replies = computed(() => repliesOf(chat.messages, props.rootId))
const timeline = computed(() => buildTimeline(replies.value))

// Rola até a resposta destacada depois que a thread renderiza.
watch(
  () => [props.highlightId, props.rootId],
  () => {
    if (!props.highlightId) return
    const id = props.highlightId
    window.setTimeout(() => {
      document.getElementById(`msg-${id}`)?.scrollIntoView({ block: 'center' })
    }, 60)
  },
  { immediate: true }
)
</script>
