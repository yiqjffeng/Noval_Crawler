import '@/assets/styles/main.scss'
// import '@/assets/styles/test-tailwind.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

// 创建应用实例
const app = createApp(App)

// 配置全局属性
app.config.globalProperties.$APP_NAME = '小说爬虫'
app.config.globalProperties.$VERSION = '1.0.0'

// 配置错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误处理:', err, info)
}

// 安装插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app')
