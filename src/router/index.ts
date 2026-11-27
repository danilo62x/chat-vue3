import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Site público (navbar + rodapé)
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/public/HomeView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/recursos',
      name: 'features',
      component: () => import('@/views/public/FeaturesView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/precos',
      name: 'pricing',
      component: () => import('@/views/public/PricingView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/sobre',
      name: 'about',
      component: () => import('@/views/public/AboutView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/contato',
      name: 'contact',
      component: () => import('@/views/public/ContactView.vue'),
      meta: { layout: 'public' },
    },

    // Autenticação (layout em branco)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/public/LoginView.vue'),
      meta: { layout: 'blank' },
    },
    {
      path: '/registro',
      name: 'register',
      component: () => import('@/views/public/RegisterView.vue'),
      meta: { layout: 'blank' },
    },

    // Área logada (protegida, layout com sidebar)
    {
      path: '/app',
      name: 'conversations',
      component: () => import('@/views/app/ConversationsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/canal/:slug',
      name: 'channel',
      component: () => import('@/views/app/ConversationsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/dm/:id',
      name: 'dm',
      component: () => import('@/views/app/ConversationsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/threads',
      name: 'threads',
      component: () => import('@/views/app/ThreadsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/busca',
      name: 'search',
      component: () => import('@/views/app/SearchView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/arquivos',
      name: 'files',
      component: () => import('@/views/app/FilesView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/chamadas',
      name: 'calls',
      component: () => import('@/views/app/CallsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/pessoas',
      name: 'people',
      component: () => import('@/views/app/PeopleView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/configuracoes',
      name: 'settings',
      component: () => import('@/views/app/SettingsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },

    // 404 (layout em branco)
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/app/NotFoundView.vue'),
      meta: { layout: 'blank' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
