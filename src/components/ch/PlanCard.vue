<template>
  <article
    :class="`relative flex flex-col rounded-2xl border p-6 md:p-7 ${
      featured ? 'border-brand-500 bg-brand-25 shadow-theme-lg dark:bg-brand-500/10' : 'surface-card'
    }`"
  >
    <span
      v-if="featured"
      class="absolute -top-3 left-6 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold text-white"
    >
      {{ t('pricing.popular') }}
    </span>
    <h3 class="text-lg font-semibold text-heading">{{ t(`pricing.plans.${plan.id}.name`) }}</h3>
    <p class="mt-1 text-sm text-muted">{{ t(`pricing.plans.${plan.id}.desc`) }}</p>

    <p class="mt-5 flex items-baseline gap-1">
      <span class="text-title-sm font-bold text-heading">
        {{ plan.price === 0 ? t('pricing.free') : formatCurrency(plan.price, locale) }}
      </span>
      <span v-if="plan.price > 0" class="text-sm text-muted">{{ t('pricing.perUser') }}</span>
    </p>

    <ul class="mt-6 flex-1 space-y-2.5">
      <li v-for="key in plan.featureKeys" :key="key" class="flex items-start gap-2.5 text-sm text-body">
        <ChIcon name="check-circle" :size="16" class-name="mt-0.5 text-success-500" />
        {{ t(`pricing.plans.${plan.id}.features.${key}`) }}
      </li>
    </ul>

    <RouterLink
      to="/registro"
      :class="`mt-7 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
        featured
          ? 'bg-brand-500 text-white hover:bg-brand-600'
          : 'border border-themed text-body hover:bg-gray-50 dark:hover:bg-gray-800'
      }`"
    >
      {{ t('pricing.cta') }}
      <ChIcon name="arrow-right" :size="16" />
    </RouterLink>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ChIcon from './ChIcon.vue'
import { formatCurrency } from '@/lib/format'

export interface Plan {
  id: string
  price: number
  featured?: boolean
  featureKeys: string[]
}

const props = defineProps<{ plan: Plan }>()

const { t, locale } = useI18n()

const featured = computed(() => Boolean(props.plan.featured))
</script>
