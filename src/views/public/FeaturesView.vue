<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
    <header class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-wider text-brand-500">{{ t('features.eyebrow') }}</p>
      <h1 class="mt-2 font-bold text-heading text-title-sm sm:text-title-md">{{ t('features.title') }}</h1>
      <p class="mt-3 text-muted">{{ t('features.subtitle') }}</p>
    </header>
  </section>

  <section
    v-for="(section, index) in SECTIONS"
    :key="section.key"
    :class="index % 2 === 1 ? 'border-y border-themed bg-gray-50 dark:bg-gray-900/40' : ''"
  >
    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
      <div :class="index % 2 === 1 ? 'lg:order-2' : ''">
        <span
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
        >
          <ChIcon :name="section.icon" :size="22" />
        </span>
        <h2 class="mt-5 font-bold text-heading text-title-sm">{{ t(`features.items.${section.key}.title`) }}</h2>
        <p class="mt-3 text-muted">{{ t(`features.items.${section.key}.long`) }}</p>
        <ul class="mt-6 space-y-3">
          <li v-for="bullet in section.bullets" :key="bullet" class="flex items-start gap-3 text-sm text-body">
            <ChIcon name="check-circle" :size="18" class-name="mt-0.5 text-success-500" />
            {{ t(`features.items.${section.key}.bullets.${bullet}`) }}
          </li>
        </ul>
      </div>
      <img
        :src="chImage(section.seed, 960, 640)"
        alt=""
        class="aspect-3/2 w-full rounded-2xl object-cover shadow-theme-lg"
      />
    </div>
  </section>

  <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <h2 class="font-bold text-heading text-title-sm">{{ t('features.extrasTitle') }}</h2>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <FeatureCard
        v-for="extra in EXTRAS"
        :key="extra.key"
        :icon="extra.icon"
        :title="t(`features.extras.${extra.key}.title`)"
        :description="t(`features.extras.${extra.key}.desc`)"
      />
    </div>
  </section>

  <section class="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
    <div class="surface-card flex flex-col items-center gap-4 rounded-3xl border p-10 text-center">
      <h2 class="font-bold text-heading text-title-sm">{{ t('features.ctaTitle') }}</h2>
      <p class="max-w-xl text-muted">{{ t('features.ctaSubtitle') }}</p>
      <RouterLink
        to="/precos"
        class="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-medium text-white transition hover:bg-brand-600"
      >
        {{ t('features.ctaButton') }}
        <ChIcon name="arrow-right" :size="18" />
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ChIcon from '@/components/ch/ChIcon.vue'
import FeatureCard from '@/components/ch/FeatureCard.vue'
import { chImage } from '@/data/mock'
import { usePageTitle } from '@/composables/usePageTitle'

const SECTIONS = [
  { key: 'channels', icon: 'hash', seed: 'recurso-canais', bullets: ['b1', 'b2', 'b3'] },
  { key: 'threads', icon: 'thread', seed: 'recurso-threads', bullets: ['b1', 'b2', 'b3'] },
  { key: 'calls', icon: 'video', seed: 'recurso-chamadas', bullets: ['b1', 'b2', 'b3'] },
  { key: 'search', icon: 'search', seed: 'recurso-busca', bullets: ['b1', 'b2', 'b3'] },
  { key: 'security', icon: 'shield-check', seed: 'recurso-seguranca', bullets: ['b1', 'b2', 'b3'] },
]

const EXTRAS = [
  { icon: 'at', key: 'mentions' },
  { icon: 'bell-off', key: 'focus' },
  { icon: 'paperclip', key: 'files' },
  { icon: 'globe', key: 'timezones' },
  { icon: 'smile', key: 'reactions' },
  { icon: 'user-plus', key: 'guests' },
]

const { t } = useI18n()
usePageTitle(() => t('nav.features'))
</script>
