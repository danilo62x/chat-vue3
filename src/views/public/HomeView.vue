<template>
  <!-- Hero -->
  <section class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-brand-500/10 blur-3xl" />
    <div
      class="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24 lg:px-8"
    >
      <div>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-themed px-3 py-1 text-xs font-medium text-muted"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-success-500" />
          {{ t('home.hero.badge') }}
        </span>
        <h1 class="mt-5 font-bold text-heading text-title-sm sm:text-title-md lg:text-title-lg">
          {{ t('home.hero.title') }}
        </h1>
        <p class="mt-5 max-w-xl text-base text-muted sm:text-lg">{{ t('home.hero.subtitle') }}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink
            to="/registro"
            class="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            {{ t('home.hero.cta') }}
            <ChIcon name="arrow-right" :size="18" />
          </RouterLink>
          <RouterLink
            to="/recursos"
            class="inline-flex h-12 items-center gap-2 rounded-xl border border-themed px-6 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {{ t('home.hero.secondary') }}
          </RouterLink>
        </div>
        <p class="mt-4 text-xs text-muted">{{ t('home.hero.note') }}</p>
      </div>

      <ChatPreview />
    </div>
  </section>

  <!-- Números -->
  <section class="border-y border-themed surface-card">
    <div class="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
      <div v-for="item in STATS" :key="item.key">
        <p class="font-bold text-brand-500 text-title-sm">{{ item.value }}</p>
        <p class="mt-1 text-sm text-muted">{{ t(`home.stats.${item.key}`) }}</p>
      </div>
    </div>
  </section>

  <!-- Recursos -->
  <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20 lg:px-8">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-wider text-brand-500">{{ t('home.features.eyebrow') }}</p>
      <h2 class="mt-2 font-bold text-heading text-title-sm">{{ t('home.features.title') }}</h2>
      <p class="mt-3 text-muted">{{ t('home.features.subtitle') }}</p>
    </div>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <FeatureCard
        v-for="feature in FEATURES"
        :key="feature.key"
        :icon="feature.icon"
        :title="t(`features.items.${feature.key}.title`)"
        :description="t(`features.items.${feature.key}.desc`)"
      />
    </div>
  </section>

  <!-- Integrações -->
  <section class="border-y border-themed bg-gray-50 dark:bg-gray-900/40">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="max-w-2xl">
        <p class="text-sm font-semibold uppercase tracking-wider text-brand-500">
          {{ t('home.integrations.eyebrow') }}
        </p>
        <h2 class="mt-2 font-bold text-heading text-title-sm">{{ t('home.integrations.title') }}</h2>
        <p class="mt-3 text-muted">{{ t('home.integrations.subtitle') }}</p>
      </div>
      <div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <div
          v-for="icon in INTEGRATIONS"
          :key="icon"
          class="surface-card flex h-20 items-center justify-center rounded-xl border text-muted transition hover:text-brand-500"
        >
          <ChIcon :name="icon" :size="24" />
        </div>
      </div>
    </div>
  </section>

  <!-- Planos -->
  <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20 lg:px-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="max-w-2xl">
        <p class="text-sm font-semibold uppercase tracking-wider text-brand-500">{{ t('home.plans.eyebrow') }}</p>
        <h2 class="mt-2 font-bold text-heading text-title-sm">{{ t('home.plans.title') }}</h2>
      </div>
      <RouterLink
        to="/precos"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400"
      >
        {{ t('home.plans.all') }}
        <ChIcon name="arrow-right" :size="16" />
      </RouterLink>
    </div>
    <div class="mt-10 grid gap-6 lg:grid-cols-3">
      <PlanCard v-for="plan in PLANS" :key="plan.id" :plan="plan" />
    </div>
  </section>

  <!-- CTA -->
  <section class="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
    <div class="overflow-hidden rounded-3xl bg-brand-500 px-6 py-14 text-center sm:px-12">
      <h2 class="mx-auto max-w-2xl font-bold text-white text-title-sm">{{ t('home.cta.title') }}</h2>
      <p class="mx-auto mt-3 max-w-xl text-brand-100">{{ t('home.cta.subtitle') }}</p>
      <RouterLink
        to="/registro"
        class="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-brand-600 transition hover:bg-brand-25"
      >
        {{ t('home.cta.button') }}
        <ChIcon name="arrow-right" :size="18" />
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ChIcon from '@/components/ch/ChIcon.vue'
import ChatPreview from '@/components/ch/ChatPreview.vue'
import FeatureCard from '@/components/ch/FeatureCard.vue'
import PlanCard from '@/components/ch/PlanCard.vue'
import { PLANS } from '@/data/plans'
import { usePageTitle } from '@/composables/usePageTitle'

const FEATURES = [
  { icon: 'hash', key: 'channels' },
  { icon: 'thread', key: 'threads' },
  { icon: 'video', key: 'calls' },
  { icon: 'search', key: 'search' },
  { icon: 'shield-check', key: 'security' },
  { icon: 'zap', key: 'integrations' },
]

const INTEGRATIONS = ['github', 'slack', 'calendar', 'folder', 'chart', 'briefcase', 'mail', 'globe']

const STATS = [
  { value: '12 mil', key: 'teams' },
  { value: '4,8', key: 'rating' },
  { value: '99,9%', key: 'uptime' },
  { value: '38 ms', key: 'latency' },
]

const { t } = useI18n()
usePageTitle()
</script>
