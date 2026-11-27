<template>
  <div class="flex min-h-screen flex-col" :style="{ backgroundColor: 'var(--tx-body-bg)' }">
    <PublicNavbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <PublicFooter />
    <ToastStack />
    <CookieBanner />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import PublicNavbar from './PublicNavbar.vue'
import PublicFooter from './PublicFooter.vue'
import ToastStack from '@/components/ui/ToastStack.vue'
import CookieBanner from '@/components/ui/CookieBanner.vue'

const route = useRoute()

watch(
  () => route.path,
  () => window.scrollTo({ top: 0 })
)
</script>
