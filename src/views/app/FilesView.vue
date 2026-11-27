<template>
  <PageHeader :title="t('files.title')" :subtitle="t('files.subtitle')" />

  <FilterBar :search="query" :search-placeholder="t('files.searchPlaceholder')" @update:search="query = $event">
    <FilterSelect :label="t('files.kind')" :value="kind" @update:value="kind = $event as AttachmentKind | 'todos'">
      <option v-for="option in KINDS" :key="option" :value="option">
        {{ option === 'todos' ? t('common.all') : t(`files.kinds.${option}`) }}
      </option>
    </FilterSelect>
    <FilterSelect
      :label="t('files.channel')"
      :value="String(channelId)"
      @update:value="channelId = $event === 'todos' ? 'todos' : Number($event)"
    >
      <option value="todos">{{ t('common.all') }}</option>
      <option v-for="channel in chat.channels" :key="channel.id" :value="channel.id">#{{ channel.name }}</option>
    </FilterSelect>
  </FilterBar>

  <EmptyState
    v-if="list.length === 0"
    icon="folder"
    :title="t('files.emptyTitle')"
    :description="t('files.emptyDesc')"
  />
  <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
    <button
      v-for="item in list"
      :key="`${item.message.id}-${item.attachment.id}`"
      type="button"
      class="surface-card overflow-hidden rounded-2xl border text-left transition hover:border-brand-300 hover:shadow-theme-sm"
      @click="selected = item"
    >
      <img
        v-if="item.attachment.kind === 'image'"
        :src="item.attachment.url"
        :alt="item.attachment.name"
        class="aspect-3/2 w-full object-cover"
      />
      <div v-else class="flex aspect-3/2 w-full items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <span
          class="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
        >
          <ChIcon :name="KIND_ICON[item.attachment.kind]" :size="24" />
        </span>
      </div>
      <div class="p-4">
        <p class="truncate text-sm font-medium text-heading">{{ item.attachment.name }}</p>
        <p class="mt-1 flex items-center gap-1.5 text-xs text-muted">
          <ChIcon :name="item.message.channelId ? 'hash' : 'user'" :size="12" />
          <span class="truncate">{{ item.conversationLabel.replace('#', '') }}</span>
          <span class="ml-auto shrink-0">{{ formatFileSize(item.attachment.sizeKb) }}</span>
        </p>
        <p class="mt-2 truncate text-[11px] text-muted">
          {{ personById(chat.people, item.authorId)?.name }} · {{ relative(item.sharedAt) }}
        </p>
      </div>
    </button>
  </div>

  <Drawer
    :open="selected !== null"
    :title="selected?.attachment.name"
    :subtitle="selected ? `${selected.conversationLabel} · ${relative(selected.sharedAt)}` : undefined"
    @close="selected = null"
  >
    <div v-if="selected" class="space-y-4">
      <img
        v-if="selected.attachment.kind === 'image'"
        :src="selected.attachment.url"
        :alt="selected.attachment.name"
        class="w-full rounded-xl object-cover"
      />
      <div
        v-else
        class="flex h-40 items-center justify-center rounded-xl border border-themed bg-gray-50 dark:bg-gray-900/50"
      >
        <ChIcon :name="KIND_ICON[selected.attachment.kind]" :size="36" class-name="text-muted" />
      </div>
      <dl class="space-y-3 text-sm">
        <div
          v-for="row in detailRows"
          :key="row.label"
          class="flex items-center justify-between gap-4"
        >
          <dt class="text-muted">{{ row.label }}</dt>
          <dd class="truncate font-medium text-heading">{{ row.value }}</dd>
        </div>
      </dl>
      <div class="rounded-xl border border-themed p-3">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-muted">{{ t('files.context') }}</p>
        <p class="mt-1.5 text-sm leading-relaxed text-body">{{ selected.message.body }}</p>
      </div>
    </div>

    <template #footer>
      <a
        v-if="selected"
        :href="selected.attachment.url"
        target="_blank"
        rel="noreferrer"
        class="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600"
      >
        <ChIcon :name="selected.attachment.kind === 'link' ? 'arrow-right' : 'download'" :size="16" />
        {{ selected.attachment.kind === 'link' ? t('files.openLink') : t('files.download') }}
      </a>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import ChIcon from '@/components/ch/ChIcon.vue'
import Drawer from '@/components/ui/Drawer.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { formatFileSize, personById, sharedFiles } from '@/data/query'
import type { AttachmentKind, SharedFile } from '@/data/types'

const KINDS: (AttachmentKind | 'todos')[] = ['todos', 'image', 'file', 'link']
const KIND_ICON: Record<AttachmentKind, string> = { image: 'image', file: 'file-text', link: 'link' }

const { t } = useI18n()
usePageTitle(() => t('appNav.files'))

const { relative } = useChatTime()
const chat = useChatStore()

const kind = ref<AttachmentKind | 'todos'>('todos')
const channelId = ref<number | 'todos'>('todos')
const query = ref('')
const selected = ref<SharedFile | null>(null)

const all = computed(() => sharedFiles(chat.messages, chat.channels, chat.dms, chat.people))

const list = computed(() =>
  all.value
    .filter((item) => (kind.value === 'todos' ? true : item.attachment.kind === kind.value))
    .filter((item) => (channelId.value === 'todos' ? true : item.message.channelId === channelId.value))
    .filter((item) =>
      !query.value.trim() ? true : item.attachment.name.toLowerCase().includes(query.value.trim().toLowerCase())
    )
)

const detailRows = computed(() => {
  const item = selected.value
  if (!item) return []
  return [
    { label: t('files.sharedBy'), value: personById(chat.people, item.authorId)?.name ?? '—' },
    { label: t('files.kind'), value: t(`files.kinds.${item.attachment.kind}`) },
    { label: t('files.size'), value: formatFileSize(item.attachment.sizeKb) },
    { label: t('files.channel'), value: item.conversationLabel },
  ]
})
</script>
