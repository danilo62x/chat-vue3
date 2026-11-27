<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
    <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div class="max-w-2xl">
        <p class="text-sm font-semibold uppercase tracking-wider text-brand-500">{{ t('about.eyebrow') }}</p>
        <h1 class="mt-2 font-bold text-heading text-title-sm sm:text-title-md">{{ t('about.title') }}</h1>
        <p class="mt-4 text-muted">{{ t('about.p1') }}</p>
        <p class="mt-3 text-muted">{{ t('about.p2') }}</p>
      </div>
      <img
        :src="chImage('sobre-time', 960, 640)"
        alt=""
        class="aspect-3/2 w-full rounded-2xl object-cover shadow-theme-lg"
      />
    </div>
  </section>

  <section class="border-y border-themed surface-card">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="max-w-2xl">
        <h2 class="font-bold text-heading text-title-sm">{{ t('about.privacyTitle') }}</h2>
        <p class="mt-3 text-muted">{{ t('about.privacyIntro') }}</p>
      </div>
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="item in PRIVACY" :key="item.key" class="rounded-2xl border border-themed p-5">
          <span
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
          >
            <ChIcon :name="item.icon" :size="20" />
          </span>
          <h3 class="mt-4 text-sm font-semibold text-heading">{{ t(`about.privacy.${item.key}.title`) }}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ t(`about.privacy.${item.key}.desc`) }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div class="max-w-2xl">
      <h2 class="font-bold text-heading text-title-sm">{{ t('about.teamTitle') }}</h2>
      <p class="mt-3 text-muted">{{ t('about.teamSubtitle') }}</p>
    </div>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="person in team" :key="person.id" class="surface-card flex items-center gap-4 rounded-2xl border p-5">
        <PersonAvatar :src="person.avatar" :name="person.name" :presence="person.presence" size="lg" />
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-heading">{{ person.name }}</p>
          <p class="truncate text-xs text-muted">{{ person.role }}</p>
          <p class="mt-1 truncate text-xs text-brand-600 dark:text-brand-400">@{{ person.handle }}</p>
        </div>
      </article>
    </div>
  </section>

  <section class="border-y border-themed bg-gray-50 dark:bg-gray-900/40">
    <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 class="font-bold text-heading text-title-sm">{{ t('about.timelineTitle') }}</h2>
      <ol class="mt-8 space-y-6 border-l border-themed pl-6">
        <li v-for="key in TIMELINE" :key="key" class="relative">
          <span
            class="absolute -left-[1.9rem] top-1 flex h-3 w-3 rounded-full border-2 border-brand-500 bg-[var(--tx-body-bg)]"
          />
          <p class="text-sm font-semibold text-heading">{{ t(`about.timeline.${key}.year`) }}</p>
          <p class="mt-1 text-sm text-muted">{{ t(`about.timeline.${key}.text`) }}</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div class="surface-card flex flex-col items-center gap-4 rounded-3xl border p-10 text-center">
      <h2 class="font-bold text-heading text-title-sm">{{ t('about.ctaTitle') }}</h2>
      <p class="max-w-xl text-muted">{{ t('about.ctaSubtitle') }}</p>
      <RouterLink
        to="/contato"
        class="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-medium text-white transition hover:bg-brand-600"
      >
        {{ t('about.cta') }}
        <ChIcon name="arrow-right" :size="18" />
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ChIcon from '@/components/ch/ChIcon.vue'
import PersonAvatar from '@/components/ch/PersonAvatar.vue'
import { PEOPLE, chImage } from '@/data/mock'
import { usePageTitle } from '@/composables/usePageTitle'

const PRIVACY = [
  { icon: 'lock', key: 'encryption' },
  { icon: 'shield-check', key: 'noAds' },
  { icon: 'download', key: 'export' },
  { icon: 'globe', key: 'hosting' },
]

const TIMELINE = ['t1', 't2', 't3', 't4']

const { t } = useI18n()
usePageTitle(() => t('nav.about'))

const team = PEOPLE.slice(0, 6)
</script>
