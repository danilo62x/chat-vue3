<template>
  <PageHeader :title="t('settings.title')" :subtitle="t('settings.subtitle')" />
  <Tabs v-model="tab" :tabs="tabs">
    <template #default="{ index }">
      <!-- Perfil -->
      <form
        v-if="index === 0"
        class="surface-card max-w-2xl space-y-5 rounded-2xl border p-5 md:p-6"
        @submit.prevent="saveProfile"
      >
        <h3 class="text-base font-semibold text-heading">{{ t('settings.profile.title') }}</h3>
        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block space-y-1.5">
            <span class="block text-sm font-medium text-heading">{{ t('settings.profile.name') }}</span>
            <input v-model="form.name" type="text" :class="input" />
          </label>
          <label class="block space-y-1.5">
            <span class="block text-sm font-medium text-heading">{{ t('settings.profile.handle') }}</span>
            <input
              :value="form.handle"
              type="text"
              :class="input"
              @input="form.handle = ($event.target as HTMLInputElement).value.replace(/\s/g, '').toLowerCase()"
            />
          </label>
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block space-y-1.5">
            <span class="block text-sm font-medium text-heading">{{ t('settings.profile.email') }}</span>
            <input v-model="form.email" type="email" :class="input" />
          </label>
          <label class="block space-y-1.5">
            <span class="block text-sm font-medium text-heading">{{ t('settings.profile.role') }}</span>
            <input v-model="form.role" type="text" :class="input" />
          </label>
        </div>
        <button
          type="submit"
          class="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <ChIcon name="check" :size="16" />
          {{ t('common.save') }}
        </button>
      </form>

      <!-- Presença -->
      <div v-else-if="index === 1" class="surface-card max-w-2xl space-y-4 rounded-2xl border p-5 md:p-6">
        <div>
          <h3 class="text-base font-semibold text-heading">{{ t('settings.presence.title') }}</h3>
          <p class="mt-1 text-sm text-muted">{{ t('settings.presence.desc') }}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="option in PRESENCES"
            :key="option"
            type="button"
            :class="`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
              me?.presence === option
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15'
                : 'border-themed hover:border-brand-300'
            }`"
            @click="selectPresence(option)"
          >
            <PresenceDot :presence="option" size="lg" />
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium text-heading">{{ t(`presence.${option}`) }}</span>
              <span class="block text-xs text-muted">{{ t(`settings.presence.hints.${option}`) }}</span>
            </span>
            <ChIcon v-if="me?.presence === option" name="check" :size="16" class-name="text-brand-500" />
          </button>
        </div>
      </div>

      <!-- Notificações -->
      <div v-else-if="index === 2" class="max-w-2xl space-y-5">
        <div class="surface-card space-y-4 rounded-2xl border p-5 md:p-6">
          <h3 class="text-base font-semibold text-heading">{{ t('settings.alerts.title') }}</h3>
          <div
            v-for="row in alertRows"
            :key="row.key"
            class="flex items-center justify-between gap-4 border-t border-themed pt-4 first:border-0 first:pt-0"
          >
            <div>
              <p class="text-sm font-medium text-heading">{{ row.label }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ row.desc }}</p>
            </div>
            <SwitchToggle :model-value="alerts[row.key]" @update:model-value="setAlert(row.key, $event)" />
          </div>
        </div>

        <div class="surface-card space-y-3 rounded-2xl border p-5 md:p-6">
          <div>
            <h3 class="text-base font-semibold text-heading">{{ t('settings.channels.title') }}</h3>
            <p class="mt-1 text-sm text-muted">{{ t('settings.channels.desc') }}</p>
          </div>
          <ul class="divide-y divide-themed">
            <li v-for="channel in chat.channels" :key="channel.id" class="flex items-center justify-between gap-4 py-3">
              <span class="flex min-w-0 items-center gap-2">
                <ChIcon :name="channel.private ? 'lock' : 'hash'" :size="15" class-name="text-muted" />
                <span class="min-w-0">
                  <span class="block truncate text-sm font-medium text-heading">{{ channel.name }}</span>
                  <span class="block truncate text-xs text-muted">{{ channel.topic }}</span>
                </span>
              </span>
              <SwitchToggle :model-value="!channel.muted" @update:model-value="chat.toggleMute(channel.id)" />
            </li>
          </ul>
        </div>
      </div>

      <!-- Aparência -->
      <div v-else class="surface-card max-w-2xl space-y-5 rounded-2xl border p-5 md:p-6">
        <h3 class="text-base font-semibold text-heading">{{ t('settings.appearance.title') }}</h3>

        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-heading">{{ t('settings.appearance.dark') }}</p>
            <p class="mt-0.5 text-xs text-muted">{{ t('settings.appearance.darkDesc') }}</p>
          </div>
          <SwitchToggle :model-value="ui.darkMode" @update:model-value="ui.setDarkMode($event)" />
        </div>

        <div class="border-t border-themed pt-5">
          <p class="text-sm font-medium text-heading">{{ t('settings.appearance.language') }}</p>
          <div class="mt-3 grid gap-2 sm:grid-cols-3">
            <button
              v-for="lang in LANGUAGES"
              :key="lang.code"
              type="button"
              :class="`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                locale === lang.code
                  ? 'border-brand-500 bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'border-themed text-body hover:border-brand-300'
              }`"
              @click="selectLanguage(lang.code)"
            >
              <span aria-hidden>{{ lang.flag }}</span>
              {{ lang.label }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </Tabs>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import ChIcon from '@/components/ch/ChIcon.vue'
import PresenceDot from '@/components/ch/PresenceDot.vue'
import SwitchToggle from '@/components/ui/SwitchToggle.vue'
import Tabs from '@/components/ui/Tabs.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useUiStore } from '@/stores/ui'
import { LANGUAGES, setLanguage, type LanguageCode } from '@/i18n'
import type { Presence } from '@/data/types'

const PRESENCES: Presence[] = ['online', 'ausente', 'ocupado', 'offline']

type AlertKey = 'mentions' | 'dm' | 'threads' | 'digest'

const { t, locale } = useI18n()
usePageTitle(() => t('appNav.settings'))

const auth = useAuthStore()
const chat = useChatStore()
const ui = useUiStore()

const tab = ref(0)

const me = computed(() => chat.people.find((p) => p.id === chat.currentUserId))

const form = ref({
  name: auth.user?.name ?? me.value?.name ?? '',
  email: auth.user?.email ?? '',
  role: auth.user?.role ?? me.value?.role ?? '',
  handle: me.value?.handle ?? '',
})

const alerts = ref<Record<AlertKey, boolean>>({ mentions: true, dm: true, threads: true, digest: false })

const input =
  'focus-ring w-full rounded-lg border border-themed bg-transparent px-3.5 py-2.5 text-sm text-body'

const tabs = computed(() => [
  { label: t('settings.tabs.profile'), icon: 'user' },
  { label: t('settings.tabs.presence'), icon: 'activity' },
  { label: t('settings.tabs.notifications'), icon: 'bell' },
  { label: t('settings.tabs.appearance'), icon: 'sun' },
])

const alertRows = computed<{ key: AlertKey; label: string; desc: string }[]>(() => [
  { key: 'mentions', label: t('settings.alerts.mentions'), desc: t('settings.alerts.mentionsDesc') },
  { key: 'dm', label: t('settings.alerts.dm'), desc: t('settings.alerts.dmDesc') },
  { key: 'threads', label: t('settings.alerts.threads'), desc: t('settings.alerts.threadsDesc') },
  { key: 'digest', label: t('settings.alerts.digest'), desc: t('settings.alerts.digestDesc') },
])

function saveProfile() {
  auth.updateProfile({ name: form.value.name, email: form.value.email, role: form.value.role })
  chat.updateCurrentPerson({ name: form.value.name, role: form.value.role, handle: form.value.handle })
  ui.notify(t('settings.profile.saved'), 'success')
}

function selectPresence(option: Presence) {
  chat.setPresence(option)
  ui.notify(t('settings.presence.saved', { status: t(`presence.${option}`) }), 'success')
}

function setAlert(key: AlertKey, value: boolean) {
  alerts.value = { ...alerts.value, [key]: value }
  ui.notify(t('settings.saved'), 'info')
}

function selectLanguage(code: LanguageCode) {
  setLanguage(code)
  ui.notify(t('settings.saved'), 'info')
}
</script>
