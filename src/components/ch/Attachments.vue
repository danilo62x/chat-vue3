<template>
  <div v-if="items.length > 0" class="mt-2 flex flex-col gap-2">
    <template v-for="attachment in items" :key="attachment.id">
      <button
        v-if="attachment.kind === 'image'"
        type="button"
        class="group block w-full max-w-md overflow-hidden rounded-xl border border-themed text-left"
        @click="emit('openImage', attachment)"
      >
        <img
          :src="attachment.url"
          :alt="attachment.name"
          class="aspect-3/2 w-full object-cover transition group-hover:opacity-90"
        />
        <span class="flex items-center gap-2 px-3 py-2 text-xs text-muted">
          <ChIcon name="image" :size="14" />
          <span class="truncate">{{ attachment.name }}</span>
          <span class="ml-auto shrink-0">{{ formatFileSize(attachment.sizeKb) }}</span>
        </span>
      </button>

      <a
        v-else
        :href="attachment.url"
        :target="attachment.kind === 'link' ? '_blank' : undefined"
        rel="noreferrer"
        class="flex max-w-md items-center gap-3 rounded-xl border border-themed px-3 py-2.5 transition hover:border-brand-300 hover:bg-brand-25 dark:hover:bg-brand-500/10"
      >
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15"
        >
          <ChIcon :name="KIND_ICON[attachment.kind]" :size="16" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium text-heading">{{ attachment.name }}</span>
          <span class="block text-xs text-muted">
            {{ attachment.kind === 'link' ? t('files.kinds.link') : formatFileSize(attachment.sizeKb) }}
          </span>
        </span>
        <ChIcon
          :name="attachment.kind === 'link' ? 'arrow-right' : 'download'"
          :size="16"
          class-name="text-muted"
        />
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import { formatFileSize } from '@/data/query'
import type { Attachment } from '@/data/types'

/** Anexos de uma mensagem: imagem em prévia, arquivo e link em cartão. */
defineProps<{ items: Attachment[] }>()
const emit = defineEmits<{ openImage: [attachment: Attachment] }>()

const { t } = useI18n()

const KIND_ICON: Record<Attachment['kind'], string> = { image: 'image', file: 'file-text', link: 'link' }
</script>
