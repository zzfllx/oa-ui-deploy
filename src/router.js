import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import HomeView from './views/HomeView.vue'
import FormView from './views/FormView.vue'
import DetailView from './views/DetailView.vue'
import ListView from './views/ListView.vue'
import { ensureSession, isLoggedIn } from './session'
import { loadRegistry } from './registry'

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/', name: 'home', component: HomeView },
  { path: '/new/:key', name: 'new', component: FormView },
  { path: '/list', name: 'list', component: ListView },
  { path: '/doc/:key/:name', name: 'doc', component: DetailView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  await ensureSession()
  await loadRegistry()
  if (to.meta.public) {
    if (to.name === 'login' && isLoggedIn()) return { name: 'home' }
    return true
  }
  if (!isLoggedIn()) {
    return { name: 'login', query: { next: to.fullPath } }
  }
  return true
})

export default router
