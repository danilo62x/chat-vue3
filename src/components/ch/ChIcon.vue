<template>
  <svg
    v-if="custom"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="`shrink-0 ${className ?? ''}`"
    v-html="custom"
  />
  <IconBase v-else :name="name" :size="size" :stroke-width="strokeWidth" :class-name="className" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconBase from '@/components/ui/IconBase.vue'

/**
 * Ícones específicos de mensageria (hash, enviar, clipe, thread, chamada…).
 * Qualquer nome desconhecido cai no `IconBase` compartilhado, então os 88
 * ícones da base continuam disponíveis pelo mesmo componente.
 */
const props = withDefaults(
  defineProps<{
    name: string
    size?: number
    strokeWidth?: number
    className?: string
  }>(),
  { size: 20, strokeWidth: 1.8 }
)

const paths: Record<string, string> = {
  hash: '<line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />',
  send: '<path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" />',
  paperclip:
    '<path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />',
  smile:
    '<circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />',
  reply: '<polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />',
  thread:
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><line x1="8.5" y1="10" x2="15.5" y2="10" /><line x1="8.5" y1="13.5" x2="13" y2="13.5" />',
  pin: '<line x1="12" y1="17" x2="12" y2="22" /><path d="M9 2h6l-1 5 3 3v2H7v-2l3-3-1-5z" />',
  video: '<path d="m22 8-6 4 6 4V8z" /><rect x="2" y="6" width="14" height="12" rx="2" />',
  'video-off':
    '<path d="M16 16v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2m4 0h4a2 2 0 0 1 2 2v2l6-4v11" /><line x1="2" y1="2" x2="22" y2="22" />',
  mic: '<rect x="9" y="2" width="6" height="11" rx="3" /><path d="M19 10a7 7 0 0 1-14 0" /><line x1="12" y1="17" x2="12" y2="22" />',
  'mic-off':
    '<path d="M9 9v1a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" /><path d="M19 10a7 7 0 0 1-1.1 3.76M5 10a7 7 0 0 0 10.5 6.06" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="2" y1="2" x2="22" y2="22" />',
  'phone-off':
    '<path d="M10.7 5.3A16 16 0 0 1 12 5a16 16 0 0 1 9 2.8v3a2 2 0 0 1-2.2 2 12 12 0 0 1-3-.8" /><path d="M5.5 8.5A16 16 0 0 0 3 10.8v-3a16 16 0 0 1 2.5-1.5" /><path d="M2 16.9v2.2a2 2 0 0 0 2.2 2 19 19 0 0 0 8.3-2.9 19 19 0 0 0 3-2.4" /><line x1="2" y1="2" x2="22" y2="22" />',
  at: '<circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9" />',
  'arrow-left': '<line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />',
  'bell-off':
    '<path d="M13.7 21a2 2 0 0 1-3.4 0" /><path d="M18.6 13.4A2 2 0 0 1 18 12V8a6 6 0 0 0-9.3-5" /><path d="M6 8v4a2 2 0 0 1-.6 1.4L4 15h11" /><line x1="2" y1="2" x2="22" y2="22" />',
  'more-horizontal':
    '<circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /><circle cx="5" cy="12" r="1.4" />',
  image: '<rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />',
  'user-plus':
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />',
  'corner-down-right': '<polyline points="15 10 20 15 15 20" /><path d="M4 4v7a4 4 0 0 0 4 4h12" />',
}

const custom = computed(() => paths[props.name])
</script>
