<template>
  <div class="border-t border-themed px-3 py-3 md:px-5">
    <ul v-if="pending.length > 0" class="mb-2 flex flex-wrap gap-2">
      <li
        v-for="attachment in pending"
        :key="attachment.id"
        class="flex items-center gap-2 rounded-lg border border-themed px-2.5 py-1.5 text-xs text-body"
      >
        <img :src="attachment.url" alt="" class="h-7 w-7 rounded object-cover" />
        <span class="max-w-40 truncate">{{ attachment.name }}</span>
        <span class="text-muted">{{ formatFileSize(attachment.sizeKb) }}</span>
        <button
          type="button"
          :aria-label="t('common.remove')"
          class="text-gray-400 transition hover:text-error-500"
          @click="pending = pending.filter((a) => a.id !== attachment.id)"
        >
          <ChIcon name="x" :size="14" />
        </button>
      </li>
    </ul>

    <div class="flex items-end gap-2 rounded-xl border border-themed bg-transparent p-2 focus-within:border-brand-300">
      <textarea
        ref="areaRef"
        :rows="1"
        :value="value"
        :placeholder="placeholder"
        class="max-h-45 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-body placeholder:text-muted focus:outline-none"
        @input="emit('update:value', ($event.target as HTMLTextAreaElement).value)"
        @keydown.enter="onKeyDown"
      />

      <div ref="emojiRef" class="relative flex items-center gap-0.5">
        <button
          type="button"
          :title="t('chat.attach')"
          :aria-label="t('chat.attach')"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
          @click="attachSample"
        >
          <ChIcon name="paperclip" :size="18" />
        </button>
        <button
          type="button"
          :title="t('chat.emoji')"
          :aria-label="t('chat.emoji')"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
          @click="emojiOpen = !emojiOpen"
        >
          <ChIcon name="smile" :size="18" />
        </button>
        <div
          v-if="emojiOpen"
          class="surface-card absolute bottom-11 right-0 z-20 flex w-56 flex-wrap gap-1 rounded-xl border p-2 shadow-theme-lg"
        >
          <button
            v-for="emoji in QUICK_EMOJIS"
            :key="emoji"
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="pickEmoji(emoji)"
          >
            <span aria-hidden>{{ emoji }}</span>
          </button>
        </div>
        <button
          type="button"
          :disabled="!canSend"
          :title="t('chat.send')"
          :aria-label="t('chat.send')"
          class="ml-1 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          @click="send"
        >
          <ChIcon name="send" :size="17" />
        </button>
      </div>
    </div>

    <p class="mt-1.5 px-1 text-[11px] text-muted">{{ t('chat.enterHint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import { useChatStore } from '@/stores/chat'
import { useUiStore } from '@/stores/ui'
import { QUICK_EMOJIS, chImage } from '@/data/mock'
import { formatFileSize } from '@/data/query'
import type { Attachment, ConversationRef } from '@/data/types'

/**
 * Caixa de escrita. O texto vive no store `ch-compose` por conversa, então
 * trocar de canal e voltar preserva o rascunho.
 */
const props = withDefaults(
  defineProps<{
    target: ConversationRef
    value: string
    parentId?: number | null
    placeholder: string
    autoFocus?: boolean
  }>(),
  { parentId: null, autoFocus: false }
)

const emit = defineEmits<{
  'update:value': [value: string]
  clear: []
}>()

const { t } = useI18n()
const chat = useChatStore()
const ui = useUiStore()

const areaRef = ref<HTMLTextAreaElement | null>(null)
const emojiRef = ref<HTMLElement | null>(null)
const emojiOpen = ref(false)
const pending = ref<Attachment[]>([])

// Altura acompanha o conteúdo, até um teto.
function resize() {
  const el = areaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 180)}px`
}

watch(() => props.value, () => nextTick(resize))

onMounted(() => {
  resize()
  if (props.autoFocus) areaRef.value?.focus()
})

function onDocumentClick(e: MouseEvent) {
  if (emojiRef.value && !emojiRef.value.contains(e.target as Node)) emojiOpen.value = false
}

watch(emojiOpen, (open) => {
  if (open) document.addEventListener('click', onDocumentClick)
  else document.removeEventListener('click', onDocumentClick)
})

onUnmounted(() => document.removeEventListener('click', onDocumentClick))

const canSend = computed(() => props.value.trim().length > 0 || pending.value.length > 0)

function send() {
  if (!canSend.value) return
  chat.sendMessage(props.target, props.value, { attachments: pending.value, parentId: props.parentId })
  emit('clear')
  pending.value = []
  areaRef.value?.focus()
}

function onKeyDown(e: KeyboardEvent) {
  if (!e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function pickEmoji(emoji: string) {
  emit('update:value', `${props.value}${emoji}`)
  emojiOpen.value = false
  areaRef.value?.focus()
}

function attachSample() {
  const seed = `upload-${Date.now()}`
  pending.value = [
    ...pending.value,
    {
      id: Date.now(),
      name: `captura-${pending.value.length + 1}.png`,
      kind: 'image',
      url: chImage(seed, 960, 640),
      sizeKb: 320 + pending.value.length * 47,
      width: 960,
      height: 640,
    },
  ]
  ui.notify(t('chat.attachmentAdded'), 'info')
}
</script>
