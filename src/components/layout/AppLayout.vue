<template>
  <div class="flex h-screen overflow-hidden" :style="{ backgroundColor: 'var(--tx-body-bg)' }">
    <AppSidebar />

    <div
      v-if="ui.sidebarMobileOpen"
      class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      @click="ui.toggleSidebarMobile(false)"
    />

    <div
      :class="`relative flex flex-1 flex-col overflow-x-hidden ${wide ? 'overflow-y-hidden' : 'overflow-y-auto'}`"
    >
      <AppHeader />
      <main :class="`flex-1 ${wide ? 'min-h-0' : ''}`">
        <div v-if="wide" class="h-full p-3 md:p-4">
          <RouterView />
        </div>
        <div v-else class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <RouterView />
        </div>
      </main>
      <AppFooter v-if="!wide" />
    </div>

    <ToastStack />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import ToastStack from '@/components/ui/ToastStack.vue'

const route = useRoute()
const ui = useUiStore()

/** Rotas de conversa usam a altura inteira da viewport, em 3 colunas. */
const wide = computed(
  () =>
    route.path === '/app' || route.path.startsWith('/app/canal/') || route.path.startsWith('/app/dm/')
)
</script>
