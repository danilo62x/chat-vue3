<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
    <header class="mx-auto max-w-2xl text-center">
      <p class="text-sm font-semibold uppercase tracking-wider text-brand-500">{{ t('pricing.eyebrow') }}</p>
      <h1 class="mt-2 font-bold text-heading text-title-sm sm:text-title-md">{{ t('pricing.title') }}</h1>
      <p class="mt-3 text-muted">{{ t('pricing.subtitle') }}</p>
    </header>

    <div class="mt-12 grid gap-6 lg:grid-cols-3">
      <PlanCard v-for="plan in PLANS" :key="plan.id" :plan="plan" />
    </div>

    <p class="mt-6 text-center text-xs text-muted">{{ t('pricing.note') }}</p>
  </section>

  <section class="border-y border-themed bg-gray-50 dark:bg-gray-900/40">
    <div class="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 class="font-bold text-heading text-title-sm">{{ t('pricing.compareTitle') }}</h2>
      <div class="surface-card mt-8 overflow-hidden rounded-2xl border">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-themed">
                <th class="px-5 py-3 font-medium text-muted">{{ t('pricing.feature') }}</th>
                <th v-for="plan in PLANS" :key="plan.id" class="px-5 py-3 font-medium text-heading">
                  {{ t(`pricing.plans.${plan.id}.name`) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in COMPARISON" :key="row" class="border-b border-themed last:border-0">
                <td class="px-5 py-3 text-body">{{ t(`pricing.compare.${row}`) }}</td>
                <td v-for="plan in PLANS" :key="plan.id" class="px-5 py-3 text-muted">
                  {{ t(`pricing.compareValues.${row}.${plan.id}`) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
    <h2 class="font-bold text-heading text-title-sm">{{ t('pricing.faqTitle') }}</h2>
    <div class="mt-8">
      <FaqAccordion :keys="FAQ_KEYS" />
    </div>
    <p class="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
      <ChIcon name="help" :size="16" />
      {{ t('pricing.faqHelp') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ChIcon from '@/components/ch/ChIcon.vue'
import FaqAccordion from '@/components/ch/FaqAccordion.vue'
import PlanCard from '@/components/ch/PlanCard.vue'
import { PLANS } from '@/data/plans'
import { usePageTitle } from '@/composables/usePageTitle'

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5']

const COMPARISON = ['history', 'calls', 'guests', 'sso', 'support']

const { t } = useI18n()
usePageTitle(() => t('nav.pricing'))
</script>
