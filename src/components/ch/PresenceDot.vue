<template>
  <span
    :title="t(`presence.${presence}`)"
    :aria-label="t(`presence.${presence}`)"
    :class="`inline-block rounded-full ${SIZE[size]} ${COLOR[presence]} ${ring ? 'ring-2' : ''} ${className ?? ''}`"
    :style="ring ? { '--tw-ring-color': 'var(--tx-card-bg)' } : undefined"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Presence } from '@/data/types'

const SIZE = { sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3 w-3' } as const

export type PresenceDotSize = keyof typeof SIZE

withDefaults(
  defineProps<{
    presence: Presence
    size?: PresenceDotSize
    /** Anel na cor do fundo, para quando o ponto fica sobre o avatar. */
    ring?: boolean
    className?: string
  }>(),
  { size: 'md', ring: false }
)

const { t } = useI18n()

const COLOR: Record<Presence, string> = {
  online: 'bg-success-500',
  ausente: 'bg-warning-400',
  ocupado: 'bg-error-500',
  offline: 'bg-gray-300 dark:bg-gray-600',
}
</script>
