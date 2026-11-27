<template>
  <div class="relative min-h-0 flex-1">
    <div ref="scrollRef" class="h-full overflow-y-auto px-3 py-4 md:px-5" @scroll="onScroll">
      <slot v-if="messages.length === 0" name="empty" />

      <div class="space-y-4">
        <template v-for="item in timeline" :key="item.key">
          <div v-if="item.type === 'date'" class="relative flex items-center py-1">
            <span class="h-px flex-1 bg-[var(--tx-border)]" />
            <span class="surface-card mx-3 rounded-full border px-3 py-1 text-[11px] font-medium text-muted">
              {{ dayLabel(item.date) }}
            </span>
            <span class="h-px flex-1 bg-[var(--tx-border)]" />
          </div>

          <div v-else-if="item.type === 'unread'" class="relative flex items-center py-1">
            <span class="h-px flex-1 bg-error-400" />
            <span class="mx-3 rounded-full bg-error-500 px-3 py-1 text-[11px] font-semibold text-white">
              {{ t('chat.newMessages') }}
            </span>
            <span class="h-px flex-1 bg-error-400" />
          </div>

          <MessageBlock
            v-else
            :group="item.group"
            :variant="variant"
            :highlight-id="highlightId"
            @open-thread="emit('openThread', $event)"
            @open-image="emit('openImage', $event)"
          />
        </template>
      </div>
    </div>

    <button
      v-if="!atBottom"
      type="button"
      class="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand-500 px-3.5 py-2 text-xs font-medium text-white shadow-theme-lg transition hover:bg-brand-600"
      @click="scrollToBottom('smooth')"
    >
      <ChIcon name="arrow-down" :size="14" />
      {{ t('chat.jumpToLatest') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import MessageBlock from './MessageBlock.vue'
import { useChatTime } from '@/composables/useChatTime'
import { buildTimeline } from '@/data/query'
import type { Attachment, Message } from '@/data/types'

const props = withDefaults(
  defineProps<{
    messages: Message[]
    /** Primeira mensagem não lida — vira o separador "Novas mensagens". */
    firstUnreadId?: number | null
    /** Muda quando a conversa muda: dispara a rolagem instantânea para o fim. */
    conversationKey: string
    variant?: 'main' | 'thread'
    highlightId?: number | null
  }>(),
  { firstUnreadId: null, variant: 'main', highlightId: null }
)

const emit = defineEmits<{
  openThread: [id: number]
  openImage: [attachment: Attachment]
}>()

const { t } = useI18n()
const { dayLabel } = useChatTime()

const scrollRef = ref<HTMLElement | null>(null)
const atBottom = ref(true)

let reflowTimer = 0
let highlightTimer = 0

const timeline = computed(() => buildTimeline(props.messages, props.firstUnreadId))

function scrollToBottom(behavior: ScrollBehavior = 'auto') {
  const el = scrollRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior })
}

// Ao abrir a conversa: vai direto para o fim, sem animação. Quando a
// navegação aponta para uma mensagem específica, quem manda é o destaque.
function jumpToEnd() {
  if (props.highlightId) return
  nextTick(() => {
    scrollToBottom('auto')
    // Imagens carregam depois e mudam a altura: reajusta uma vez.
    window.clearTimeout(reflowTimer)
    reflowTimer = window.setTimeout(() => scrollToBottom('auto'), 250)
  })
}

onMounted(jumpToEnd)
watch(() => props.conversationKey, jumpToEnd)

// Ao enviar (ou receber) uma mensagem: rola suavemente para o fim.
watch(
  () => props.messages.length,
  () => {
    if (props.highlightId) return
    nextTick(() => scrollToBottom('smooth'))
  }
)

// Vindo da busca ou da lista de threads: centraliza a mensagem apontada.
watch(
  [() => props.highlightId, () => props.conversationKey],
  () => {
    if (!props.highlightId) return
    window.clearTimeout(highlightTimer)
    highlightTimer = window.setTimeout(() => {
      document.getElementById(`msg-${props.highlightId}`)?.scrollIntoView({ block: 'center' })
    }, 300)
  },
  { immediate: true }
)

onUnmounted(() => {
  window.clearTimeout(reflowTimer)
  window.clearTimeout(highlightTimer)
})

function onScroll() {
  const el = scrollRef.value
  if (!el) return
  atBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

defineExpose({ scrollToBottom })
</script>
