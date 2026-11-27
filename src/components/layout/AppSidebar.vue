<template>
  <aside
    :style="{ width: ui.sidebarCollapsed ? '90px' : '280px' }"
    :class="`surface-sidebar fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden border-r px-4 transition-[transform,width] duration-300 lg:static lg:translate-x-0 ${
      ui.sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
    }`"
  >
    <div :class="`flex items-center pt-7 pb-6 ${ui.sidebarCollapsed ? 'justify-center' : 'justify-between'}`">
      <RouterLink to="/app" class="flex items-center gap-2.5">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white shadow-theme-sm"
        >
          <ChIcon name="thread" :size="18" />
        </span>
        <span v-if="!ui.sidebarCollapsed" data-brand-text class="text-lg font-semibold">{{ t('brand') }}</span>
      </RouterLink>
      <button
        v-if="!ui.sidebarCollapsed"
        type="button"
        class="is-sidebar-inactive hidden h-8 w-8 items-center justify-center rounded-lg border border-themed lg:flex"
        :title="t('appNav.collapse')"
        @click="ui.toggleSidebar()"
      >
        <ChIcon name="chevron-right" :size="14" class-name="rotate-180" />
      </button>
    </div>

    <div class="flex flex-col gap-5 overflow-y-auto no-scrollbar pb-4">
      <nav v-for="section in SECTIONS" :key="section.titleKey">
        <h3 v-if="!ui.sidebarCollapsed" class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider">
          {{ t(section.titleKey) }}
        </h3>
        <ul class="flex flex-col gap-1">
          <li v-for="item in section.items" :key="item.to">
            <RouterLink
              :to="item.to"
              :class="navLinkClass(isActive(item))"
              :title="ui.sidebarCollapsed ? t(item.labelKey) : undefined"
              @click="ui.toggleSidebarMobile(false)"
            >
              <ChIcon :name="item.icon" :size="20" />
              <span v-if="!ui.sidebarCollapsed" class="flex-1">{{ t(item.labelKey) }}</span>
              <span
                v-if="item.badge === 'unread' && unread > 0"
                class="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white"
              >
                {{ unread }}
              </span>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="mt-auto space-y-3 border-t border-themed py-4">
      <div v-if="!ui.sidebarCollapsed && me" class="rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
        <p class="text-xs font-medium text-muted">{{ t('appNav.statusTitle') }}</p>
        <p class="mt-1 flex items-center gap-2 text-sm font-semibold text-heading">
          <PresenceDot :presence="me.presence" size="md" />
          {{ t(`presence.${me.presence}`) }}
        </p>
        <RouterLink
          to="/app/configuracoes"
          class="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-brand-500 text-xs font-medium text-white transition hover:bg-brand-600"
        >
          {{ t('appNav.changeStatus') }}
        </RouterLink>
      </div>
      <button
        type="button"
        :class="navLinkClass(false)"
        :title="ui.sidebarCollapsed ? t('appNav.logout') : undefined"
        @click="onLogout"
      >
        <ChIcon name="logout" :size="20" />
        <span v-if="!ui.sidebarCollapsed">{{ t('appNav.logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import ChIcon from '@/components/ch/ChIcon.vue'
import PresenceDot from '@/components/ch/PresenceDot.vue'
import { totalUnread } from '@/data/query'

interface NavItem {
  to: string
  labelKey: string
  icon: string
  end?: boolean
  badge?: 'unread'
}

const SECTIONS: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: 'appNav.messagesSection',
    items: [
      { to: '/app', labelKey: 'appNav.conversations', icon: 'thread', end: true, badge: 'unread' },
      { to: '/app/threads', labelKey: 'appNav.threads', icon: 'corner-down-right' },
      { to: '/app/busca', labelKey: 'appNav.search', icon: 'search' },
    ],
  },
  {
    titleKey: 'appNav.teamSection',
    items: [
      { to: '/app/pessoas', labelKey: 'appNav.people', icon: 'users' },
      { to: '/app/chamadas', labelKey: 'appNav.calls', icon: 'video' },
      { to: '/app/arquivos', labelKey: 'appNav.files', icon: 'folder' },
    ],
  },
  {
    titleKey: 'appNav.settingsSection',
    items: [{ to: '/app/configuracoes', labelKey: 'appNav.settings', icon: 'settings' }],
  },
]

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const auth = useAuthStore()
const chat = useChatStore()

const me = computed(() => chat.people.find((p) => p.id === chat.currentUserId))
const unread = computed(() => totalUnread(chat.channels, chat.dms))

function isActive(item: NavItem): boolean {
  return item.end ? route.path === item.to : route.path.startsWith(item.to)
}

function navLinkClass(active: boolean): string {
  return `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    ui.sidebarCollapsed ? 'justify-center' : ''
  } ${active ? 'is-sidebar-active' : 'is-sidebar-inactive'}`
}

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>
