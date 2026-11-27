<template>
  <div class="surface-card flex h-full flex-col overflow-hidden rounded-2xl border">
    <div class="flex items-center justify-between border-b border-themed px-4 py-3.5">
      <h2 class="text-sm font-semibold text-heading">{{ t('detail.title') }}</h2>
      <button
        type="button"
        :aria-label="t('common.close')"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:text-heading"
        @click="emit('close')"
      >
        <ChIcon name="x" :size="16" />
      </button>
    </div>

    <div class="flex gap-1 border-b border-themed px-2">
      <button
        v-for="item in TABS"
        :key="item.id"
        type="button"
        :class="`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition ${
          tab === item.id
            ? 'border-brand-500 text-brand-600 dark:text-brand-400'
            : 'border-transparent text-muted hover:text-body'
        }`"
        @click="tab = item.id"
      >
        <ChIcon :name="item.icon" :size="14" />
        {{ item.label }}
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4">
      <!-- Sobre -->
      <div v-if="tab === 'about'" class="space-y-5">
        <template v-if="channel">
          <div class="flex items-center gap-3">
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
            >
              <ChIcon :name="channel.private ? 'lock' : 'hash'" :size="20" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-base font-semibold text-heading">{{ channel.name }}</p>
              <p class="text-xs text-muted">
                {{ channel.private ? t('detail.privateChannel') : t('detail.publicChannel') }}
              </p>
            </div>
          </div>
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-muted">{{ t('detail.topic') }}</p>
            <p class="mt-1 text-sm leading-relaxed text-body">{{ channel.topic }}</p>
          </div>
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-muted">{{ t('detail.description') }}</p>
            <p class="mt-1 text-sm leading-relaxed text-body">{{ channel.description }}</p>
          </div>
          <div class="flex items-center justify-between rounded-xl border border-themed px-3.5 py-3">
            <span class="flex items-center gap-2 text-sm text-body">
              <ChIcon :name="channel.muted ? 'bell-off' : 'bell'" :size="16" />
              {{ t('detail.notifications') }}
            </span>
            <button
              type="button"
              :class="`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                channel.muted
                  ? 'bg-gray-100 text-body dark:bg-gray-800'
                  : 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
              }`"
              @click="chat.toggleMute(channel.id)"
            >
              {{ channel.muted ? t('detail.muted') : t('detail.active') }}
            </button>
          </div>
        </template>

        <template v-if="person">
          <div class="flex flex-col items-center text-center">
            <PersonAvatar :src="person.avatar" :name="person.name" :presence="person.presence" size="lg" />
            <p class="mt-3 text-base font-semibold text-heading">{{ person.name }}</p>
            <p class="text-xs text-muted">@{{ person.handle }}</p>
          </div>
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-muted">{{ t('detail.role') }}</p>
            <p class="mt-1 text-sm leading-relaxed text-body">{{ person.role }}</p>
          </div>
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-muted">{{ t('detail.timezone') }}</p>
            <p class="mt-1 text-sm leading-relaxed text-body">{{ person.timezone.replace('_', ' ') }}</p>
          </div>
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {{ t('detail.presenceLabel') }}
            </p>
            <p class="mt-1 text-sm leading-relaxed text-body">
              {{ t(`presence.${person.presence}`) }} ·
              {{ t('detail.lastSeen', { when: relative(person.lastSeenAt) }) }}
            </p>
          </div>
        </template>

        <div v-if="pinned.length > 0">
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{{ t('detail.pinned') }}</p>
          <ul class="space-y-2">
            <li v-for="message in pinned" :key="message.id" class="rounded-xl border border-themed px-3 py-2.5">
              <p class="text-xs font-medium text-heading">{{ personById(chat.people, message.authorId)?.name }}</p>
              <p class="mt-1 line-clamp-3 text-xs text-muted">{{ message.body }}</p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Membros -->
      <ul v-else-if="tab === 'members'" class="space-y-1">
        <template v-for="id in memberIds" :key="id">
          <li v-if="personById(chat.people, id)">
            <div class="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-gray-50 dark:hover:bg-white/5">
              <PersonAvatar
                :src="personById(chat.people, id)!.avatar"
                :name="personById(chat.people, id)!.name"
                :presence="personById(chat.people, id)!.presence"
                size="sm"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-heading">{{ personById(chat.people, id)!.name }}</p>
                <p class="truncate text-xs text-muted">{{ personById(chat.people, id)!.role }}</p>
              </div>
            </div>
          </li>
        </template>
        <li class="pt-2">
          <RouterLink
            to="/app/pessoas"
            class="flex items-center justify-center gap-2 rounded-lg border border-dashed border-themed px-3 py-2 text-xs font-medium text-muted transition hover:text-brand-500"
          >
            <ChIcon name="user-plus" :size="14" />
            {{ t('detail.seeDirectory') }}
          </RouterLink>
        </li>
      </ul>

      <!-- Arquivos -->
      <div v-else>
        <p v-if="files.length === 0" class="py-8 text-center text-sm text-muted">{{ t('detail.noFiles') }}</p>
        <ul v-else class="space-y-2">
          <li v-for="attachment in files" :key="attachment.id">
            <a
              :href="attachment.url"
              :target="attachment.kind === 'link' ? '_blank' : undefined"
              rel="noreferrer"
              class="flex items-center gap-3 rounded-xl border border-themed px-3 py-2.5 transition hover:border-brand-300"
            >
              <img
                v-if="attachment.kind === 'image'"
                :src="attachment.url"
                alt=""
                class="h-10 w-10 rounded-lg object-cover"
              />
              <span
                v-else
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15"
              >
                <ChIcon :name="attachment.kind === 'link' ? 'link' : 'file-text'" :size="16" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-heading">{{ attachment.name }}</span>
                <span class="block text-xs text-muted">{{ formatFileSize(attachment.sizeKb) }}</span>
              </span>
            </a>
          </li>
        </ul>
        <RouterLink
          to="/app/arquivos"
          class="mt-3 flex items-center justify-center gap-2 rounded-lg border border-dashed border-themed px-3 py-2 text-xs font-medium text-muted transition hover:text-brand-500"
        >
          <ChIcon name="folder" :size="14" />
          {{ t('detail.allFiles') }}
        </RouterLink>
      </div>
    </div>

    <div v-if="dm" class="border-t border-themed px-4 py-3 text-[11px] text-muted">
      {{ t('detail.lastMessage', { when: listStamp(dm.lastMessageAt) }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import PersonAvatar from './PersonAvatar.vue'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { channelById, dmById, filesOfConversation, formatFileSize, personById, pinnedOf } from '@/data/query'
import type { ConversationRef } from '@/data/types'

type Tab = 'about' | 'members' | 'files'

/** Terceira coluna: contexto do canal (tópico, membros, arquivos) ou da pessoa. */
const props = defineProps<{ target: ConversationRef }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const { relative, listStamp } = useChatTime()
const chat = useChatStore()

const tab = ref<Tab>('about')

const channel = computed(() =>
  props.target.kind === 'channel' ? channelById(chat.channels, props.target.id) : undefined
)
const dm = computed(() => (props.target.kind === 'dm' ? dmById(chat.dms, props.target.id) : undefined))
const person = computed(() => (dm.value ? personById(chat.people, dm.value.personId) : undefined))

const memberIds = computed(() => (channel.value ? channel.value.memberIds : person.value ? [person.value.id] : []))
const files = computed(() => filesOfConversation(chat.messages, props.target))
const pinned = computed(() => pinnedOf(chat.messages, props.target))

const TABS = computed<{ id: Tab; label: string; icon: string }[]>(() => [
  { id: 'about', label: t('detail.about'), icon: 'info' },
  { id: 'members', label: t('detail.members'), icon: 'users' },
  { id: 'files', label: t('detail.files'), icon: 'folder' },
])
</script>
