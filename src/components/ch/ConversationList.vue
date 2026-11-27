<template>
  <div class="surface-card flex h-full flex-col overflow-hidden rounded-2xl border">
    <div class="border-b border-themed px-4 py-3.5">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-semibold text-heading">{{ t('chat.conversations') }}</h2>
        <button
          type="button"
          :title="t('chat.newConversation')"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-themed text-muted transition hover:text-brand-500"
          @click="router.push('/app/pessoas')"
        >
          <ChIcon name="user-plus" :size="16" />
        </button>
      </div>
      <div class="relative mt-3">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <ChIcon name="search" :size="15" />
        </span>
        <input
          v-model="query"
          :placeholder="t('chat.filterPlaceholder')"
          class="focus-ring w-full rounded-lg border border-themed bg-transparent py-2 pl-9 pr-3 text-sm text-body"
        />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-2 py-3">
      <div class="flex items-center justify-between px-3">
        <h3 class="text-[11px] font-semibold uppercase tracking-wider text-muted">{{ t('chat.channels') }}</h3>
        <span class="text-[11px] text-muted">{{ visibleChannels.length }}</span>
      </div>
      <ul class="mt-1 space-y-0.5">
        <li v-for="channel in visibleChannels" :key="channel.id">
          <RouterLink
            :to="`/app/canal/${channel.slug}`"
            :class="itemClass(active.kind === 'channel' && active.id === channel.id)"
            @click="compose.setMobilePane('thread')"
          >
            <span
              :class="`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                active.kind === 'channel' && active.id === channel.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-muted dark:bg-gray-800'
              }`"
            >
              <ChIcon :name="channel.private ? 'lock' : 'hash'" :size="15" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-1.5">
                <span
                  :class="`truncate text-sm ${
                    channel.unread > 0 ? 'font-semibold text-heading' : 'font-medium text-body'
                  }`"
                >
                  {{ channel.name }}
                </span>
                <ChIcon v-if="channel.muted" name="bell-off" :size="12" class-name="text-gray-400" />
                <span class="ml-auto text-[11px] text-muted">
                  {{ previewOf({ kind: 'channel', id: channel.id }).stamp }}
                </span>
              </span>
              <span class="mt-0.5 flex items-center gap-1">
                <span
                  v-if="compose.drafts[`c-${channel.id}`]"
                  class="truncate text-xs text-warning-600 dark:text-warning-500"
                >
                  {{ t('chat.draftPrefix') }} {{ compose.drafts[`c-${channel.id}`] }}
                </span>
                <span v-else class="truncate text-xs text-muted">
                  {{ previewOf({ kind: 'channel', id: channel.id }).text }}
                </span>
              </span>
            </span>
            <span
              v-if="channel.unread > 0"
              :class="`ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white ${
                channel.muted ? 'bg-gray-400' : 'bg-brand-500'
              }`"
            >
              {{ channel.unread }}
            </span>
          </RouterLink>
        </li>
        <li v-if="visibleChannels.length === 0" class="px-3 py-2 text-xs text-muted">{{ t('common.noResults') }}</li>
      </ul>

      <div class="mt-5">
        <div class="flex items-center justify-between px-3">
          <h3 class="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {{ t('chat.directMessages') }}
          </h3>
          <span class="text-[11px] text-muted">{{ visibleDms.length }}</span>
        </div>
        <ul class="mt-1 space-y-0.5">
          <li v-for="row in visibleDms" :key="row.dm.id">
            <RouterLink
              :to="`/app/dm/${row.dm.id}`"
              :class="itemClass(active.kind === 'dm' && active.id === row.dm.id)"
              @click="compose.setMobilePane('thread')"
            >
              <PersonAvatar
                :src="row.person.avatar"
                :name="row.person.name"
                :presence="row.person.presence"
                size="xs"
              />
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-1.5">
                  <span
                    :class="`truncate text-sm ${
                      row.dm.unread > 0 ? 'font-semibold text-heading' : 'font-medium text-body'
                    }`"
                  >
                    {{ row.person.name }}
                  </span>
                  <span class="ml-auto text-[11px] text-muted">
                    {{ previewOf({ kind: 'dm', id: row.dm.id }).stamp }}
                  </span>
                </span>
                <span class="mt-0.5 block">
                  <span
                    v-if="compose.drafts[`d-${row.dm.id}`]"
                    class="block truncate text-xs text-warning-600 dark:text-warning-500"
                  >
                    {{ t('chat.draftPrefix') }} {{ compose.drafts[`d-${row.dm.id}`] }}
                  </span>
                  <span v-else class="block truncate text-xs text-muted">
                    {{ previewOf({ kind: 'dm', id: row.dm.id }).text }}
                  </span>
                </span>
              </span>
              <span
                v-if="row.dm.unread > 0"
                class="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white"
              >
                {{ row.dm.unread }}
              </span>
            </RouterLink>
          </li>
          <li v-if="visibleDms.length === 0" class="px-3 py-2 text-xs text-muted">{{ t('common.noResults') }}</li>
        </ul>
      </div>
    </div>

    <div class="border-t border-themed px-3 py-2.5">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted transition hover:bg-gray-50 hover:text-brand-500 dark:hover:bg-white/5"
        @click="chat.markAllRead()"
      >
        <ChIcon name="check-circle" :size="14" />
        {{ t('chat.markAllRead') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import PersonAvatar from './PersonAvatar.vue'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { useComposeStore } from '@/stores/compose'
import { lastMessageOf, personById } from '@/data/query'
import type { ConversationRef, DirectThread, Person } from '@/data/types'

defineProps<{ active: ConversationRef }>()

const { t } = useI18n()
const router = useRouter()
const { listStamp } = useChatTime()
const chat = useChatStore()
const compose = useComposeStore()

const query = ref('')

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

const needle = computed(() => normalize(query.value.trim()))

const visibleChannels = computed(() =>
  chat.channels.filter(
    (c) => !needle.value || normalize(c.name).includes(needle.value) || normalize(c.topic).includes(needle.value)
  )
)

const visibleDms = computed(() =>
  chat.dms
    .map((d) => ({ dm: d, person: personById(chat.people, d.personId) }))
    .filter((row): row is { dm: DirectThread; person: Person } =>
      Boolean(row.person && (!needle.value || normalize(row.person.name).includes(needle.value)))
    )
)

function previewOf(target: ConversationRef): { text: string; stamp: string } {
  const last = lastMessageOf(chat.messages, target)
  if (!last) return { text: t('chat.noMessages'), stamp: '' }
  const author =
    last.authorId === chat.currentUserId ? t('chat.you') : personById(chat.people, last.authorId)?.name.split(' ')[0]
  return { text: `${author}: ${last.body}`, stamp: listStamp(last.createdAt) }
}

function itemClass(isActive: boolean): string {
  return `group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
    isActive ? 'bg-brand-50 dark:bg-brand-500/15' : 'hover:bg-gray-50 dark:hover:bg-white/5'
  }`
}
</script>
