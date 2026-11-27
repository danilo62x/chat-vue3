<template>
  <div class="flex gap-3 px-1">
    <div class="pt-0.5">
      <PersonAvatar
        v-if="author"
        :src="author.avatar"
        :name="author.name"
        :presence="author.presence"
        size="md"
      />
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-baseline gap-2">
        <span class="text-sm font-semibold text-heading">{{ author?.name ?? '—' }}</span>
        <span v-if="variant === 'main'" class="hidden text-xs text-muted sm:inline">{{ author?.role }}</span>
        <span class="text-[11px] text-muted">{{ time(group.startedAt) }}</span>
      </div>
      <div class="mt-0.5 space-y-0.5">
        <MessageRow
          v-for="message in group.messages"
          :key="message.id"
          :message="message"
          :variant="variant"
          :highlighted="highlightId === message.id"
          @open-thread="emit('openThread', $event)"
          @open-image="emit('openImage', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PersonAvatar from './PersonAvatar.vue'
import MessageRow from './MessageRow.vue'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { personById } from '@/data/query'
import type { Attachment, MessageGroup } from '@/data/types'

const props = withDefaults(
  defineProps<{
    group: MessageGroup
    /** Na thread lateral as ações de resposta somem. */
    variant?: 'main' | 'thread'
    highlightId?: number | null
  }>(),
  { variant: 'main', highlightId: null }
)

const emit = defineEmits<{
  openThread: [id: number]
  openImage: [attachment: Attachment]
}>()

const { time } = useChatTime()
const chat = useChatStore()

const author = computed(() => personById(chat.people, props.group.authorId))
</script>
