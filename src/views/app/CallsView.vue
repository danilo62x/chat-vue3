<template>
  <PageHeader :title="t('calls.title')" :subtitle="t('calls.subtitle')">
    <template v-if="!active" #action>
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex h-10 items-center gap-2 rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          @click="startCall('voz')"
        >
          <ChIcon name="phone" :size="16" />
          {{ t('calls.startVoice') }}
        </button>
        <button
          type="button"
          class="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="startCall('video')"
        >
          <ChIcon name="video" :size="16" />
          {{ t('calls.startVideo') }}
        </button>
      </div>
    </template>
  </PageHeader>

  <section
    v-if="active"
    class="mb-6 overflow-hidden rounded-2xl border border-themed bg-gray-900 text-white dark:bg-gray-950"
  >
    <div class="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-3">
      <span class="flex items-center gap-2 text-sm font-medium">
        <span class="relative flex h-2.5 w-2.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-error-400 opacity-75" />
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-error-500" />
        </span>
        {{ t('calls.inCall') }}
      </span>
      <span class="text-sm text-gray-300">
        {{
          active.channelId
            ? `#${channelById(chat.channels, active.channelId)?.name ?? ''}`
            : t(`calls.kinds.${active.kind}`)
        }}
      </span>
      <span class="ml-auto font-mono text-sm tabular-nums">{{ formatClock(elapsed) }}</span>
    </div>

    <div class="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
      <template v-for="id in active.participantIds" :key="id">
        <div
          v-if="personById(chat.people, id)"
          class="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gray-800"
        >
          <img
            v-if="active.kind === 'video' && !(id === chat.currentUserId && cameraOff)"
            :src="personById(chat.people, id)!.avatar"
            :alt="personById(chat.people, id)!.name"
            class="h-full w-full object-cover opacity-80"
          />
          <img
            v-else
            :src="personById(chat.people, id)!.avatar"
            :alt="personById(chat.people, id)!.name"
            class="h-16 w-16 rounded-full object-cover"
          />
          <span class="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-xs">
            <ChIcon v-if="id === chat.currentUserId && muted" name="mic-off" :size="12" />
            {{ id === chat.currentUserId ? t('calls.you') : personById(chat.people, id)!.name }}
          </span>
        </div>
      </template>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 px-5 py-4">
      <button
        type="button"
        :title="muted ? t('calls.unmute') : t('calls.mute')"
        :aria-label="muted ? t('calls.unmute') : t('calls.mute')"
        :class="`flex h-11 w-11 items-center justify-center rounded-full transition ${
          muted ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
        }`"
        @click="muted = !muted"
      >
        <ChIcon :name="muted ? 'mic-off' : 'mic'" :size="18" />
      </button>
      <button
        type="button"
        :title="cameraOff ? t('calls.cameraOn') : t('calls.cameraOff')"
        :aria-label="cameraOff ? t('calls.cameraOn') : t('calls.cameraOff')"
        :class="`flex h-11 w-11 items-center justify-center rounded-full transition ${
          cameraOff ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
        }`"
        @click="cameraOff = !cameraOff"
      >
        <ChIcon :name="cameraOff ? 'video-off' : 'video'" :size="18" />
      </button>
      <button
        type="button"
        class="ml-2 inline-flex h-11 items-center gap-2 rounded-full bg-error-500 px-6 text-sm font-medium text-white transition hover:bg-error-600"
        @click="hangUp"
      >
        <ChIcon name="phone-off" :size="18" />
        {{ t('calls.hangUp') }}
      </button>
    </div>
  </section>

  <EmptyState
    v-if="history.length === 0"
    icon="phone"
    :title="t('calls.emptyTitle')"
    :description="t('calls.emptyDesc')"
  />
  <div v-else class="surface-card overflow-hidden rounded-2xl border">
    <ul class="divide-y divide-themed">
      <li v-for="call in history" :key="call.id" class="flex items-center gap-3 px-4 py-3.5 md:px-5">
        <span
          :class="`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            call.missed
              ? 'bg-error-50 text-error-500 dark:bg-error-500/15'
              : 'bg-brand-50 text-brand-500 dark:bg-brand-500/15'
          }`"
        >
          <ChIcon :name="call.kind === 'video' ? 'video' : 'phone'" :size="18" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-heading">{{ callTitle(call) }}</p>
          <p class="truncate text-xs text-muted">
            {{ t(`calls.kinds.${call.kind}`) }} · {{ listStamp(call.startedAt) }} · {{ relative(call.startedAt) }}
          </p>
        </div>
        <div class="hidden -space-x-2 sm:flex">
          <template v-for="id in call.participantIds.slice(0, 4)" :key="id">
            <PersonAvatar
              v-if="personById(chat.people, id)"
              :src="personById(chat.people, id)!.avatar"
              :name="personById(chat.people, id)!.name"
              size="xs"
            />
          </template>
        </div>
        <div class="w-24 shrink-0 text-right">
          <Badge v-if="call.missed" color="error">{{ t('calls.missed') }}</Badge>
          <span v-else class="text-sm text-body">{{ formatCallSeconds(call.seconds) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import ChIcon from '@/components/ch/ChIcon.vue'
import PersonAvatar from '@/components/ch/PersonAvatar.vue'
import Badge from '@/components/ui/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useChatTime } from '@/composables/useChatTime'
import { useChatStore } from '@/stores/chat'
import { useUiStore } from '@/stores/ui'
import { callsSorted, channelById, formatCallSeconds, personById } from '@/data/query'
import type { Call, CallKind } from '@/data/types'

interface ActiveCall {
  kind: CallKind
  channelId: number | null
  participantIds: number[]
  startedAt: string
}

const { t } = useI18n()
usePageTitle(() => t('appNav.calls'))

const { relative, listStamp } = useChatTime()
const route = useRoute()
const router = useRouter()
const chat = useChatStore()
const ui = useUiStore()

const active = ref<ActiveCall | null>(null)
const elapsed = ref(0)
const muted = ref(false)
const cameraOff = ref(false)

let ticker = 0

// Uma chamada iniciada a partir do cabeçalho da conversa chega por query string.
watch(
  () => route.query,
  (query) => {
    const kind = query.iniciar as string | undefined
    if (kind !== 'voz' && kind !== 'video') return
    const channelParam = query.canal as string | undefined
    const personParam = query.pessoa as string | undefined

    const channelId = channelParam ? Number(channelParam) : null
    const participantIds = channelId
      ? (channelById(chat.channels, channelId)?.memberIds.slice(0, 5) ?? [chat.currentUserId])
      : [chat.currentUserId, Number(personParam)].filter((n) => !Number.isNaN(n))

    active.value = { kind, channelId, participantIds, startedAt: new Date().toISOString() }
    elapsed.value = 0
    cameraOff.value = kind === 'voz'
    router.replace({ path: '/app/chamadas', query: {} })
  },
  { immediate: true }
)

watch(
  active,
  (call) => {
    window.clearInterval(ticker)
    if (!call) return
    ticker = window.setInterval(() => {
      elapsed.value += 1
    }, 1000)
  },
  { immediate: true }
)

onUnmounted(() => window.clearInterval(ticker))

const history = computed(() => callsSorted(chat.calls))

function callTitle(call: Call): string {
  const channel = call.channelId ? channelById(chat.channels, call.channelId) : undefined
  if (channel) return `#${channel.name}`
  const others = call.participantIds.filter((id) => id !== chat.currentUserId)
  return personById(chat.people, others[0] ?? call.participantIds[0])?.name ?? '—'
}

function hangUp() {
  if (!active.value) return
  chat.addCall({
    kind: active.value.kind,
    channelId: active.value.channelId,
    participantIds: active.value.participantIds,
    startedAt: active.value.startedAt,
    seconds: elapsed.value,
    missed: false,
  })
  ui.notify(t('calls.ended', { duration: formatCallSeconds(elapsed.value) }), 'success')
  active.value = null
  elapsed.value = 0
}

function startCall(kind: CallKind) {
  active.value = {
    kind,
    channelId: null,
    participantIds: [
      chat.currentUserId,
      chat.people.find((p) => p.id !== chat.currentUserId)?.id ?? chat.currentUserId,
    ],
    startedAt: new Date().toISOString(),
  }
  elapsed.value = 0
  cameraOff.value = kind === 'voz'
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
</script>
