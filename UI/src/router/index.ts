import { createRouter, createWebHistory } from 'vue-router'
import { routeTransitions } from '@/utils/animation'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Search',
      component: () => import('@/views/SearchView.vue'),
      meta: {
        title: '搜索小说',
        transition: 'fade'
      }
    },
    {
      path: '/results',
      name: 'SearchResults',
      component: () => import('@/views/ResultsView.vue'),
      meta: {
        title: '搜索结果',
        transition: 'slideLeft'
      }
    },
    {
      path: '/book/:id',
      name: 'BookDetail',
      component: () => import('@/views/DetailView.vue'),
      meta: {
        title: '书籍详情',
        transition: 'slideLeft'
      }
    },
    {
      path: '/read/:bookId/:chapterId',
      name: 'ChapterRead',
      component: () => import('@/views/ChapterReadView.vue'),
      props: true,
      meta: {
        title: '章节阅读',
        transition: 'slideLeft'
      }
    },
    {
      path: '/download/:id?',
      name: 'Download',
      component: () => import('@/views/DownloadView.vue'),
      meta: {
        title: '下载配置',
        transition: 'slideLeft'
      }
    },
    {
      path: '/tasks',
      name: 'DownloadTasks',
      component: () => import('@/views/TasksView.vue'),
      meta: {
        title: '下载任务',
        transition: 'slideLeft'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: '页面未找到',
        transition: 'fade'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 小说爬虫`
  }

  next()
})

// 路由切换动画
router.afterEach((to, from) => {
  const toTransition = to.meta?.transition as keyof typeof routeTransitions || 'fade'
  const fromTransition = from.meta?.transition as keyof typeof routeTransitions || 'fade'

  // 这里可以根据需要处理路由切换动画
})

export default router
