<template>
  <span class="relative inline-flex shrink-0">
    <img :src="src" :alt="name" :class="`rounded-full object-cover ${AV_SIZE[size]}`" />
    <PresenceDot
      v-if="presence"
      :presence="presence"
      :size="size === 'lg' ? 'lg' : 'sm'"
      ring
      class-name="absolute -bottom-0.5 -right-0.5"
    />
  </span>
</template>

<script setup lang="ts">
import PresenceDot from './PresenceDot.vue'
import type { Presence } from '@/data/types'

const AV_SIZE = { xs: 'h-7 w-7', sm: 'h-9 w-9', md: 'h-10 w-10', lg: 'h-14 w-14' } as const

export type PersonAvatarSize = keyof typeof AV_SIZE

/** Avatar redondo com o ponto de presença no canto. */
withDefaults(
  defineProps<{
    src: string
    name: string
    presence?: Presence
    size?: PersonAvatarSize
  }>(),
  { size: 'sm' }
)
</script>
