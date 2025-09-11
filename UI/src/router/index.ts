import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Downloads from '../views/Downloads.vue'
import Library from '../views/Library.vue'
import BookDetail from '../views/BookDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/downloads',
    name: 'Downloads',
    component: Downloads,
  },
  {
    path: '/library',
    name: 'Library',
    component: Library,
  },
  {
    path: '/book/:bookName',
    name: 'BookDetail',
    component: BookDetail,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router