import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Landing from '../views/Landing.vue'
import CommuneDetail from '../views/CommuneDetail.vue'
import MentionsLegales from '../views/MentionsLegales.vue'
import CommunePrint from '../views/CommunePrint.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: Landing
  },
  {
    path: '/carte',
    redirect: '/'
  },
  {
    path: '/commune/:codeInsee',
    name: 'commune-detail',
    component: CommuneDetail,
    props: true
  },
  {
    path: '/commune/:codeInsee/print',
    name: 'commune-print',
    component: CommunePrint,
    props: true
  },
  {
    path: '/mentions-legales',
    name: 'mentions-legales',
    component: MentionsLegales
  },
  {
    path: '/share',
    name: 'share',
    component: () => import('../views/ShareView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
