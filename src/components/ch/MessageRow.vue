<template>
  <!-- Modo edição -->
  <div v-if="isEditing" class="rounded-xl border border-brand-300 bg-brand-25 p-2 dark:bg-brand-500/10">
    <textarea
      ref="areaRef"
      :rows="3"
      v-model="draft"
      class="focus-ring w-full resize-none rounded-lg border border-themed bg-transparent px-3 py-2 text-sm text-body"
      @keydown.enter="onEditKey"
      @keydown.esc="compose.setEditing(null)"
    />
    <div class="mt-2 flex items-center gap-2">
      <button
        type="button"
        class="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
        @click="saveEdit"
      >
        {{ t('common.save') }}
      </button>
      <button
        type="button"
        class="rounded-lg border border-themed px-3 py-1.5 text-xs font-medium text-body"
        @click="compose.setEditing(null)"
      >
        {{ t('common.cancel') }}
      </button>
    </div>
  </div>

  <!-- Mensagem -->
  <div
    v-else
    :id="`msg-${message.id}`"
    :class="`group/msg relative -mx-2 rounded-lg px-2 py-0.5 transition ${
      highlighted
        ? 'bg-warning-50 ring-1 ring-warning-300 dark:bg-warning-500/10'
        : 'hover:bg-gray-50 dark:hover:bg-white/5'
    }`"
  >
    <span
      class="absolute left-0 top-1 hidden -translate-x-full pr-2 text-[10px] text-muted opacity-0 transition group-hover/msg:opacity-100 lg:block"
    >
      {{ time(message.createdAt) }}
    </span>
    <p class="whitespace-pre-wrap break-words text-sm leading-relaxed text-body">
      {{ message.body }}
      <span v-if="message.editedAt" class="ml-1.5 text-[11px] text-muted">({{ t('chat.edited') }})</span>
      <span
        v-if="message.pinned"
        class="ml-2 inline-flex items-center gap-1 align-middle text-[11px] text-warning-600 dark:text-warning-500"
      >
        <ChIcon name="pin" :size="11" /> {{ t('chat.pinned') }}
      </span>
    </p>

    <Attachments :items="message.attachments" @open-image="emit('openImage', $event)" />

    <div v-if="message.reactions.length > 0" class="mt-1.5 flex flex-wrap gap-1">
      <button
        v-for="reaction in message.reactions"
        :key="reaction.emoji"
        type="button"
        :title="reactionNames(reaction)"
        :class="`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
          reaction.personIds.includes(chat.currentUserId)
            ? 'border-brand-300 bg-brand-50 text-brand-600 dark:border-brand-500/40 dark:bg-brand-500/15 dark:text-brand-400'
            : 'border-themed text-muted hover:border-brand-300'
        }`"
        @click="chat.toggleReaction(message.id, reaction.emoji)"
      >
        <span aria-hidden>{{ reaction.emoji }}</span>
        {{ reaction.personIds.length }}
      </button>
    </div>

    <button
      v-if="replies > 0 && variant === 'main'"
      type="button"
      class="mt-1.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
      @click="emit('openThread', message.id)"
    >
      <ChIcon name="corner-down-right" :size="13" />
      {{ plural('chat.replyCount', replies) }}
    </button>

    <!-- Barra de ações que aparece no hover -->
    <div
      class="surface-card absolute -top-3 right-2 z-10 hidden items-center gap-0.5 rounded-lg border p-0.5 shadow-theme-sm group-hover/msg:flex"
    >
      <div ref="pickerRef" class="relative">
        <button
          type="button"
          :title="t('chat.react')"
          :aria-label="t('chat.react')"
          class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
          @click="pickerOpen = !pickerOpen"
        >
          <ChIcon name="smile" :size="15" />
        </button>
        <div
          v-if="pickerOpen"
          class="surface-card absolute right-0 top-9 z-20 flex w-56 flex-wrap gap-1 rounded-xl border p-2 shadow-theme-lg"
        >
          <button
            v-for="emoji in QUICK_EMOJIS"
            :key="emoji"
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="pickReaction(emoji)"
          >
            <span aria-hidden>{{ emoji }}</span>
          </button>
        </div>
      </div>

      <button
        v-if="variant === 'main'"
        type="button"
        :title="t('chat.replyInThread')"
        :aria-label="t('chat.replyInThread')"
        class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
        @click="emit('openThread', message.id)"
      >
        <ChIcon name="thread" :size="15" />
      </button>

      <button
        type="button"
        :title="message.pinned ? t('chat.unpin') : t('chat.pin')"
        :aria-label="message.pinned ? t('chat.unpin') : t('chat.pin')"
        class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
        @click="onTogglePin"
      >
        <ChIcon name="pin" :size="15" />
      </button>

      <button
        v-if="isMine"
        type="button"
        :title="t('common.edit')"
        :aria-label="t('common.edit')"
        class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
        @click="compose.setEditing(message.id)"
      >
        <ChIcon name="edit" :size="15" />
      </button>

      <button
        v-if="isMine"
        type="button"
        :title="t('common.remove')"
        :aria-label="t('common.remove')"
        class="flex h-7 w-7 items-center justify-center rounded-md text-error-500 transition hover:bg-error-50 dark:hover:bg-error-500/15"
        @click="onRemove"
      >
        <ChIcon name="trash" :size="15" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import Attachments from './Attachments.vue'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { useComposeStore } from '@/stores/compose'
import { useUiStore } from '@/stores/ui'
import { personById, replyCount } from '@/data/query'
import { QUICK_EMOJIS } from '@/data/mock'
import type { Attachment, Message, Reaction } from '@/data/types'

const props = withDefaults(
  defineProps<{
    message: Message
    variant?: 'main' | 'thread'
    highlighted?: boolean
  }>(),
  { variant: 'main', highlighted: false }
)

const emit = defineEmits<{
  openThread: [id: number]
  openImage: [attachment: Attachment]
}>()

const { t } = useI18n()
const { time, plural } = useChatTime()
const chat = useChatStore()
const compose = useComposeStore()
const ui = useUiStore()

const pickerOpen = ref(false)
const pickerRef = ref<HTMLElement | null>(null)
const areaRef = ref<HTMLTextAreaElement | null>(null)
const draft = ref(props.message.body)

const isMine = computed(() => props.message.authorId === chat.currentUserId)
const isEditing = computed(() => compose.editingId === props.message.id)
const replies = computed(() => (props.variant === 'main' ? replyCount(chat.messages, props.message.id) : 0))

function reactionNames(reaction: Reaction): string {
  return reaction.personIds
    .map((id) => personById(chat.people, id)?.name ?? '')
    .filter(Boolean)
    .join(', ')
}

function onDocumentClick(e: MouseEvent) {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) pickerOpen.value = false
}

watch(pickerOpen, (open) => {
  if (open) document.addEventListener('click', onDocumentClick)
  else document.removeEventListener('click', onDocumentClick)
})

onUnmounted(() => document.removeEventListener('click', onDocumentClick))

watch(
  [isEditing, () => props.message.body],
  ([editing]) => {
    if (editing) {
      draft.value = props.message.body
      nextTick(() => areaRef.value?.focus())
    }
  },
  { immediate: true }
)

function pickReaction(emoji: string) {
  chat.toggleReaction(props.message.id, emoji)
  pickerOpen.value = false
}

function onEditKey(e: KeyboardEvent) {
  if (!e.shiftKey) {
    e.preventDefault()
    saveEdit()
  }
}

function saveEdit() {
  if (draft.value.trim()) {
    chat.editMessage(props.message.id, draft.value)
    ui.notify(t('chat.messageEdited'), 'success')
  }
  compose.setEditing(null)
}

function onTogglePin() {
  const wasPinned = props.message.pinned
  chat.togglePin(props.message.id)
  ui.notify(wasPinned ? t('chat.unpinned') : t('chat.pinnedDone'), 'info')
}

function onRemove() {
  chat.removeMessage(props.message.id)
  ui.notify(t('chat.messageRemoved'), 'warning')
}
</script>
