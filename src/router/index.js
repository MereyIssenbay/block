import { createRouter, createWebHistory } from 'vue-router'
import MainView from "@/pages/Main.vue"
import RegisterView from "@/pages/Register.vue"

const routes = [
  {
    path: '/',
    name: 'main',
    component: MainView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
