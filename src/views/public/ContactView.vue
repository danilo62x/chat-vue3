<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
    <header class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-wider text-brand-500">{{ t('contact.eyebrow') }}</p>
      <h1 class="mt-2 font-bold text-heading text-title-sm sm:text-title-md">{{ t('contact.title') }}</h1>
      <p class="mt-3 text-muted">{{ t('contact.subtitle') }}</p>
    </header>

    <div class="mt-10 grid gap-8 lg:grid-cols-5">
      <div class="lg:col-span-3">
        <div class="surface-card rounded-2xl border p-6 shadow-theme-sm md:p-8">
          <form class="space-y-5" @submit="onSubmit">
            <div class="grid gap-5 sm:grid-cols-2">
              <FormField name="name" :label="t('contact.form.name')" placeholder="Marina Alencar" />
              <FormField
                name="email"
                :label="t('contact.form.email')"
                type="email"
                placeholder="marina@empresa.com"
              />
            </div>
            <div class="grid gap-5 sm:grid-cols-2">
              <FormField name="company" :label="t('contact.form.company')" placeholder="Vega Logística" />
              <FormField name="teamSize" :label="t('contact.form.teamSize')" as="select">
                <option value="">{{ t('contact.form.select') }}</option>
                <option value="1-10">1–10</option>
                <option value="11-50">11–50</option>
                <option value="51-200">51–200</option>
                <option value="200+">200+</option>
              </FormField>
            </div>
            <FormField name="subject" :label="t('contact.form.subject')" as="select">
              <option value="">{{ t('contact.form.select') }}</option>
              <option v-for="subject in SUBJECTS" :key="subject" :value="subject">
                {{ t(`contact.subjects.${subject}`) }}
              </option>
            </FormField>
            <FormField
              name="message"
              :label="t('contact.form.message')"
              as="textarea"
              :rows="5"
              :placeholder="t('contact.form.messagePlaceholder')"
            />
            <FormField name="terms" :label="t('contact.form.terms')" as="checkbox" />
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {{ t('contact.form.submit') }}
              <ChIcon name="send" :size="17" />
            </button>
          </form>
        </div>
      </div>

      <aside class="space-y-4 lg:col-span-2">
        <div v-for="channel in CHANNELS" :key="channel.key" class="surface-card flex gap-4 rounded-2xl border p-5">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
          >
            <ChIcon :name="channel.icon" :size="20" />
          </span>
          <div class="min-w-0">
            <p class="text-xs uppercase tracking-wider text-muted">{{ t(`contact.channels.${channel.key}`) }}</p>
            <p class="mt-1 text-sm font-medium text-heading">{{ channel.value ?? t('contact.hoursValue') }}</p>
          </div>
        </div>

        <div class="rounded-2xl border border-themed bg-brand-25 p-5 dark:bg-brand-500/10">
          <h2 class="text-sm font-semibold text-heading">{{ t('contact.statusTitle') }}</h2>
          <p class="mt-1.5 text-sm text-muted">{{ t('contact.statusDesc') }}</p>
          <p class="mt-3 flex items-center gap-2 text-sm font-medium text-success-600 dark:text-success-500">
            <span class="h-2 w-2 rounded-full bg-success-500" />
            {{ t('contact.statusOk') }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as Yup from 'yup'
import ChIcon from '@/components/ch/ChIcon.vue'
import FormField from '@/components/ui/FormField.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useUiStore } from '@/stores/ui'

const CHANNELS: { icon: string; key: string; value: string | null }[] = [
  { icon: 'mail', key: 'email', value: 'oi@elo.app' },
  { icon: 'phone', key: 'phone', value: '+55 11 4003-2210' },
  { icon: 'map-pin', key: 'address', value: 'Rua Tabapuã, 145 — São Paulo, SP' },
  { icon: 'clock', key: 'hours', value: null },
]

const SUBJECTS = ['vendas', 'suporte', 'parceria', 'imprensa']

const { t } = useI18n()
usePageTitle(() => t('nav.contact'))

const ui = useUiStore()

const schema = computed(() =>
  toTypedSchema(
    Yup.object({
      name: Yup.string().required(t('validation.required')),
      email: Yup.string().email(t('validation.email')).required(t('validation.required')),
      company: Yup.string(),
      teamSize: Yup.string(),
      subject: Yup.string().required(t('validation.required')),
      message: Yup.string().min(10, t('validation.min_other', { count: 10 })).required(t('validation.required')),
      terms: Yup.boolean().oneOf([true], t('validation.terms')),
    })
  )
)

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    email: '',
    company: '',
    teamSize: '',
    subject: '',
    message: '',
    terms: false,
  },
})

const onSubmit = handleSubmit(() => {
  ui.notifySuccess(t('contact.success'))
  resetForm()
})
</script>
