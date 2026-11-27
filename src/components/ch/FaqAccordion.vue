<template>
  <div class="divide-y divide-themed overflow-hidden rounded-2xl border border-themed surface-card">
    <div v-for="key in keys" :key="key">
      <button
        type="button"
        :aria-expanded="open === key"
        class="flex w-full items-center gap-4 px-5 py-4 text-left md:px-6"
        @click="open = open === key ? null : key"
      >
        <span class="flex-1 text-sm font-medium text-heading">{{ t(`faq.${key}.q`) }}</span>
        <ChIcon
          name="chevron-down"
          :size="18"
          :class-name="`shrink-0 text-muted transition-transform ${open === key ? 'rotate-180' : ''}`"
        />
      </button>
      <p v-if="open === key" class="px-5 pb-5 text-sm leading-relaxed text-muted md:px-6">
        {{ t(`faq.${key}.a`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'

const props = defineProps<{
  /** Chaves em `faq.<key>.q` / `faq.<key>.a`. */
  keys: string[]
}>()

const { t } = useI18n()
const open = ref<string | null>(props.keys[0] ?? null)
</script>
