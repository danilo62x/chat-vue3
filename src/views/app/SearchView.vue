<template>
  <PageHeader :title="t('search.title')" :subtitle="t('search.subtitle')">
    <template #action>
      <button
        type="button"
        class="inline-flex h-10 items-center gap-2 rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
        @click="compose.resetSearch()"
      >
        <ChIcon name="refresh-cw" :size="16" />
        {{ t('search.clear') }}
      </button>
    </template>
  </PageHeader>

  <FilterBar
    :search="compose.search.text"
    :search-placeholder="t('search.placeholder')"
    @update:search="compose.setSearch({ text: $event })"
  >
    <FilterSelect
      :label="t('search.channel')"
      :value="String(compose.search.channelId)"
      @update:value="compose.setSearch({ channelId: $event === 'todos' ? 'todos' : Number($event) })"
    >
      <option value="todos">{{ t('common.all') }}</option>
      <option v-for="channel in chat.channels" :key="channel.id" :value="channel.id">#{{ channel.name }}</option>
    </FilterSelect>
    <FilterSelect
      :label="t('search.person')"
      :value="String(compose.search.personId)"
      @update:value="compose.setSearch({ personId: $event === 'todos' ? 'todos' : Number($event) })"
    >
      <option value="todos">{{ t('common.all') }}</option>
      <option v-for="person in chat.people" :key="person.id" :value="person.id">{{ person.name }}</option>
    </FilterSelect>
    <FilterSelect
      :label="t('search.period')"
      :value="compose.search.period"
      @update:value="compose.setSearch({ period: $event as SearchPeriod })"
    >
      <option v-for="period in PERIODS" :key="period" :value="period">{{ t(`search.periods.${period}`) }}</option>
    </FilterSelect>
  </FilterBar>

  <EmptyState
    v-if="!compose.search.text.trim()"
    icon="search"
    :title="t('search.startTitle')"
    :description="t('search.startDesc')"
  />
  <EmptyState
    v-else-if="hits.length === 0"
    icon="search"
    :title="t('search.emptyTitle')"
    :description="t('search.emptyDesc')"
  />
  <template v-else>
    <p class="mb-3 text-sm text-muted">{{ plural('search.count', hits.length) }}</p>
    <ul class="space-y-2">
      <li v-for="hit in hits" :key="hit.message.id">
        <button
          type="button"
          class="surface-card flex w-full gap-3 rounded-xl border p-4 text-left transition hover:border-brand-300"
          @click="openHit(hit.conversation, hit.message.id)"
        >
          <PersonAvatar
            v-if="personById(chat.people, hit.message.authorId)"
            :src="personById(chat.people, hit.message.authorId)!.avatar"
            :name="personById(chat.people, hit.message.authorId)!.name"
            :presence="personById(chat.people, hit.message.authorId)!.presence"
            size="sm"
          />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-heading">
                {{ personById(chat.people, hit.message.authorId)?.name }}
              </span>
              <span
                class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-body dark:bg-gray-800"
              >
                <ChIcon :name="hit.conversation.kind === 'channel' ? 'hash' : 'user'" :size="11" />
                {{ hit.conversationLabel.replace('#', '') }}
              </span>
              <span class="text-xs text-muted">{{ relative(hit.message.createdAt) }}</span>
            </div>
            <p class="mt-1 text-sm leading-relaxed text-body">
              <!-- Aplica o destaque `**termo**` devolvido por `excerptFor` -->
              <template v-for="(part, i) in hit.excerpt.split('**')" :key="i">
                <mark
                  v-if="i % 2 === 1"
                  class="rounded bg-warning-100 px-0.5 text-warning-700 dark:bg-warning-500/25 dark:text-warning-300"
                >
                  {{ part }}
                </mark>
                <span v-else>{{ part }}</span>
              </template>
            </p>
          </div>
          <ChIcon name="arrow-right" :size="16" class-name="mt-1 shrink-0 text-muted" />
        </button>
      </li>
    </ul>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import ChIcon from '@/components/ch/ChIcon.vue'
import PersonAvatar from '@/components/ch/PersonAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { useComposeStore } from '@/stores/compose'
import { channelById, personById, searchMessages } from '@/data/query'
import type { ConversationRef, SearchPeriod } from '@/data/types'

const PERIODS: SearchPeriod[] = ['todos', 'hoje', 'semana', 'mes']

const { t } = useI18n()
usePageTitle(() => t('appNav.search'))

const router = useRouter()
const { relative, plural } = useChatTime()
const chat = useChatStore()
const compose = useComposeStore()

const hits = computed(() => searchMessages(chat.messages, chat.channels, chat.dms, chat.people, compose.search))

function openHit(conversation: ConversationRef, messageId: number) {
  compose.setMobilePane('thread')
  if (conversation.kind === 'channel') {
    const channel = channelById(chat.channels, conversation.id)
    router.push({ path: `/app/canal/${channel?.slug ?? ''}`, query: { msg: String(messageId) } })
  } else {
    router.push({ path: `/app/dm/${conversation.id}`, query: { msg: String(messageId) } })
  }
}
</script>
