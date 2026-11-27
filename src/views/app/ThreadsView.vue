<template>
  <PageHeader :title="t('threads.title')" :subtitle="t('threads.subtitle')">
    <template #action>
      <div class="flex rounded-lg border border-themed p-0.5">
        <button
          v-for="option in OPTIONS"
          :key="String(option.value)"
          type="button"
          :class="`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            onlyMine === option.value ? 'bg-brand-500 text-white' : 'text-muted hover:text-body'
          }`"
          @click="onlyMine = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </template>
  </PageHeader>

  <EmptyState
    v-if="list.length === 0"
    icon="message-circle"
    :title="t('threads.emptyTitle')"
    :description="t('threads.emptyDesc')"
  />
  <ul v-else class="space-y-3">
    <li v-for="thread in list" :key="thread.root.id">
      <button
        type="button"
        class="surface-card w-full rounded-2xl border p-4 text-left transition hover:border-brand-300 md:p-5"
        @click="goToThread(thread.root.id, thread.conversation)"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-body dark:bg-gray-800"
          >
            <ChIcon :name="thread.conversation.kind === 'channel' ? 'hash' : 'user'" :size="12" />
            {{ conversationLabel(thread.conversation, chat.channels, chat.dms, chat.people).replace('#', '') }}
          </span>
          <Badge v-if="thread.following" color="brand">{{ t('threads.followingBadge') }}</Badge>
          <span class="ml-auto text-xs text-muted">{{ relative(thread.lastReplyAt) }}</span>
        </div>

        <div class="mt-3 flex gap-3">
          <PersonAvatar
            v-if="personById(chat.people, thread.root.authorId)"
            :src="personById(chat.people, thread.root.authorId)!.avatar"
            :name="personById(chat.people, thread.root.authorId)!.name"
            :presence="personById(chat.people, thread.root.authorId)!.presence"
            size="sm"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-heading">
              {{ personById(chat.people, thread.root.authorId)?.name }}
            </p>
            <p class="mt-0.5 line-clamp-2 text-sm text-body">{{ thread.root.body }}</p>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-3 border-t border-themed pt-3">
          <div class="flex -space-x-2">
            <template v-for="id in thread.participantIds.slice(0, 4)" :key="id">
              <img
                v-if="personById(chat.people, id)"
                :src="personById(chat.people, id)!.avatar"
                :alt="personById(chat.people, id)!.name"
                class="h-6 w-6 rounded-full object-cover ring-2"
                :style="{ '--tw-ring-color': 'var(--tx-card-bg)' }"
              />
            </template>
          </div>
          <span class="text-xs font-medium text-brand-600 dark:text-brand-400">
            {{ plural('chat.replyCount', thread.replies.length) }}
          </span>
          <span
            v-if="unreadReplies(thread) > 0"
            class="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
          >
            {{ plural('threads.newReplies', unreadReplies(thread)) }}
          </span>
          <span
            v-if="thread.replies[thread.replies.length - 1]"
            class="ml-auto hidden truncate text-xs text-muted sm:block"
          >
            {{ personById(chat.people, thread.replies[thread.replies.length - 1].authorId)?.name.split(' ')[0] }}:
            {{ thread.replies[thread.replies.length - 1].body }}
          </span>
        </div>
      </button>
    </li>
  </ul>
  <p class="mt-6 text-center text-xs text-muted">{{ plural('threads.hint', chat.dms.length) }}</p>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import ChIcon from '@/components/ch/ChIcon.vue'
import PersonAvatar from '@/components/ch/PersonAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Badge from '@/components/ui/Badge.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { useComposeStore } from '@/stores/compose'
import { channelById, conversationLabel, personById, threadSummaries, type ThreadSummary } from '@/data/query'
import type { ConversationRef } from '@/data/types'

const { t } = useI18n()
usePageTitle(() => t('appNav.threads'))

const router = useRouter()
const { relative, plural } = useChatTime()
const chat = useChatStore()
const compose = useComposeStore()

const onlyMine = ref(true)

const OPTIONS = computed(() => [
  { value: true, label: t('threads.following') },
  { value: false, label: t('threads.all') },
])

const all = computed(() => threadSummaries(chat.messages, chat.currentUserId))
const list = computed(() => (onlyMine.value ? all.value.filter((thread) => thread.following) : all.value))

function unreadReplies(thread: ThreadSummary): number {
  return thread.replies.filter((r) => r.authorId !== chat.currentUserId).length
}

function goToThread(rootId: number, conversation: ConversationRef) {
  compose.openThread(rootId)
  compose.setMobilePane('thread')
  if (conversation.kind === 'channel') {
    const channel = channelById(chat.channels, conversation.id)
    router.push({ path: `/app/canal/${channel?.slug ?? ''}`, query: { msg: String(rootId) } })
  } else {
    router.push({ path: `/app/dm/${conversation.id}`, query: { msg: String(rootId) } })
  }
}
</script>
