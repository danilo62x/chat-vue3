<template>
  <div class="h-5 px-5">
    <p v-if="names.length > 0" class="flex items-center gap-2 text-xs text-muted">
      <span class="flex items-center gap-0.5">
        <span
          v-for="delay in [0, 150, 300]"
          :key="delay"
          class="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400"
          :style="{ animationDelay: `${delay}ms` }"
        />
      </span>
      {{ names.length === 1 ? t('chat.typingOne', { name: names[0] }) : t('chat.typingMany', { names: names.join(', ') }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import { personById } from '@/data/query'

/** "Bianca está digitando…", alimentado pelo timer da resposta simulada. */
const props = defineProps<{
  /** Chave da conversa (`c-2`, `d-1`…). */
  conversationKey: string
}>()

const { t } = useI18n()
const chat = useChatStore()

const names = computed(() => {
  const ids = chat.typing[props.conversationKey] ?? []
  return ids.map((id) => personById(chat.people, id)?.name.split(' ')[0]).filter(Boolean) as string[]
})
</script>
