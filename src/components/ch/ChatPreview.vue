<template>
  <div class="surface-card overflow-hidden rounded-2xl border shadow-theme-xl">
    <div class="flex items-center gap-2 border-b border-themed px-4 py-3">
      <span class="flex h-2.5 w-2.5 rounded-full bg-error-400" />
      <span class="flex h-2.5 w-2.5 rounded-full bg-warning-400" />
      <span class="flex h-2.5 w-2.5 rounded-full bg-success-400" />
      <span class="ml-3 text-xs text-muted">elo.app / #{{ channel.name }}</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-[9rem_1fr]">
      <aside class="hidden border-r border-themed p-3 sm:block">
        <p class="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{{ t('chat.channels') }}</p>
        <ul class="mt-2 space-y-0.5">
          <li v-for="item in CHANNELS.slice(0, 5)" :key="item.id">
            <span
              :class="`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${
                item.id === channel.id ? 'bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/15' : 'text-muted'
              }`"
            >
              <ChIcon :name="item.private ? 'lock' : 'hash'" :size="11" />
              <span class="truncate">{{ item.name }}</span>
              <span
                v-if="item.unread > 0"
                class="ml-auto rounded-full bg-brand-500 px-1.5 text-[9px] font-semibold text-white"
              >
                {{ item.unread }}
              </span>
            </span>
          </li>
        </ul>
      </aside>

      <div class="space-y-4 p-4">
        <div v-for="message in preview" :key="message.id" class="flex gap-2.5">
          <PersonAvatar
            v-if="personById(PEOPLE, message.authorId)"
            :src="personById(PEOPLE, message.authorId)!.avatar"
            :name="personById(PEOPLE, message.authorId)!.name"
            size="xs"
          />
          <div class="min-w-0">
            <p class="flex items-baseline gap-2">
              <span class="text-xs font-semibold text-heading">{{ personById(PEOPLE, message.authorId)?.name }}</span>
              <span class="text-[10px] text-muted">{{ formatTime(message.createdAt, locale) }}</span>
            </p>
            <p class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-body">{{ message.body }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 rounded-xl border border-themed px-3 py-2">
          <span class="flex-1 text-xs text-muted">{{ t('chat.messageChannel', { name: channel.name }) }}</span>
          <span class="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500 text-white">
            <ChIcon name="send" :size="12" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import PersonAvatar from './PersonAvatar.vue'
import { CHANNELS, MESSAGES, PEOPLE } from '@/data/mock'
import { personById, rootMessages } from '@/data/query'
import { formatTime } from '@/lib/format'

/** Prévia estática da interface, usada no hero do site público. */
const { t, locale } = useI18n()

const preview = rootMessages(MESSAGES, { kind: 'channel', id: 2 }).slice(-4)
const channel = CHANNELS[1]
</script>
