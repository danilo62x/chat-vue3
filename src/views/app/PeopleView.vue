<template>
  <PageHeader :title="t('people.title')" :subtitle="t('people.subtitle')" />

  <FilterBar :search="query" :search-placeholder="t('people.searchPlaceholder')" @update:search="query = $event">
    <FilterSelect
      :label="t('people.presence')"
      :value="presence"
      @update:value="presence = $event as Presence | 'todos'"
    >
      <option v-for="option in PRESENCES" :key="option" :value="option">
        {{ option === 'todos' ? t('common.all') : t(`presence.${option}`) }}
      </option>
    </FilterSelect>
  </FilterBar>

  <EmptyState
    v-if="list.length === 0"
    icon="users"
    :title="t('people.emptyTitle')"
    :description="t('people.emptyDesc')"
  />
  <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
    <article v-for="person in list" :key="person.id" class="surface-card rounded-2xl border p-5">
      <div class="flex items-start gap-3">
        <PersonAvatar :src="person.avatar" :name="person.name" :presence="person.presence" size="lg" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-heading">
            {{ person.name }}
            <span v-if="person.id === chat.currentUserId" class="ml-1.5 text-xs font-normal text-muted">
              ({{ t('chat.you') }})
            </span>
          </p>
          <p class="truncate text-xs text-muted">@{{ person.handle }}</p>
          <p class="mt-1 truncate text-xs text-body">{{ person.role }}</p>
        </div>
      </div>

      <dl class="mt-4 space-y-2 border-t border-themed pt-4 text-xs">
        <div class="flex items-center justify-between gap-2">
          <dt class="text-muted">{{ t('people.status') }}</dt>
          <dd class="flex items-center gap-1.5 font-medium text-heading">
            <PresenceDot :presence="person.presence" size="sm" />
            {{ t(`presence.${person.presence}`) }}
          </dd>
        </div>
        <div class="flex items-center justify-between gap-2">
          <dt class="text-muted">{{ t('people.localTime') }}</dt>
          <dd class="font-medium text-heading">{{ localTime(person.timezone) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-2">
          <dt class="text-muted">{{ t('people.timezone') }}</dt>
          <dd class="truncate font-medium text-heading">{{ person.timezone.replace('_', ' ') }}</dd>
        </div>
        <div class="flex items-center justify-between gap-2">
          <dt class="text-muted">{{ t('people.lastSeen') }}</dt>
          <dd class="font-medium text-heading">{{ relative(person.lastSeenAt) }}</dd>
        </div>
      </dl>

      <button
        v-if="person.id !== chat.currentUserId"
        type="button"
        class="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-themed text-sm font-medium text-body transition hover:border-brand-300 hover:text-brand-500"
        @click="openDm(person.id)"
      >
        <ChIcon name="message-circle" :size="16" />
        {{ t('people.sendMessage') }}
      </button>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import ChIcon from '@/components/ch/ChIcon.vue'
import PresenceDot from '@/components/ch/PresenceDot.vue'
import PersonAvatar from '@/components/ch/PersonAvatar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { useUiStore } from '@/stores/ui'
import type { Presence } from '@/data/types'

const PRESENCES: (Presence | 'todos')[] = ['todos', 'online', 'ausente', 'ocupado', 'offline']

const LOCALE: Record<string, string> = { 'pt-BR': 'pt-BR', en: 'en-US', es: 'es-ES' }

const { t, locale } = useI18n()
usePageTitle(() => t('appNav.people'))

const router = useRouter()
const { relative } = useChatTime()
const chat = useChatStore()
const ui = useUiStore()

const query = ref('')
const presence = ref<Presence | 'todos'>('todos')

const list = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return chat.people
    .filter((person) => (presence.value === 'todos' ? true : person.presence === presence.value))
    .filter(
      (person) =>
        !needle ||
        person.name.toLowerCase().includes(needle) ||
        person.handle.includes(needle) ||
        person.role.toLowerCase().includes(needle)
    )
})

function localTime(timezone: string): string {
  try {
    const intlLocale = LOCALE[locale.value] ?? LOCALE['pt-BR']
    return new Intl.DateTimeFormat(intlLocale, { timeZone: timezone, hour: '2-digit', minute: '2-digit' }).format(
      new Date()
    )
  } catch {
    return '—'
  }
}

function openDm(personId: number) {
  const dm = chat.dms.find((d) => d.personId === personId)
  if (dm) {
    router.push(`/app/dm/${dm.id}`)
    return
  }
  ui.notify(t('people.noDm'), 'info')
}
</script>
