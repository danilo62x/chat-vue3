<template>
  <article class="surface-card rounded-2xl border p-6 transition hover:border-brand-300 hover:shadow-theme-sm">
    <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
      <ChIcon :name="icon" :size="22" />
    </span>
    <h3 class="mt-5 text-base font-semibold text-heading">{{ title }}</h3>
    <p class="mt-2 text-sm leading-relaxed text-muted">{{ description }}</p>
  </article>
</template>

<script setup lang="ts">
import ChIcon from './ChIcon.vue'

defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>
