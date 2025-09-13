<template>
  <div id="app" class="app-container">
    <!-- 全局加载掩罩 -->
    <div v-if="isAppLoading" class="app-loading">
      <LoadingSpinner 
        size="large" 
        text="正在初始化应用..."
        :animated="true"
      />
    </div>
    
    <!-- 主应用内容 -->
    <div v-else class="app-content">
      <!-- 路由过渡动画 -->
      <router-view v-slot="{ Component, route }">
        <transition
          :name="getTransitionName(route)"
          mode="out-in"
          appear
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
    
    <!-- 全局通知 -->
    <div class="global-notifications">
      <!-- 这里可以添加全局通知组件 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { LoadingSpinner } from '@/components/loading'
import { useDownloadStore } from '@/stores'

const route = useRoute()
const downloadStore = useDownloadStore()

// 应用状态
const isAppLoading = ref(true)

// 计算属性
const isDarkMode = computed(() => true) // 默认暗黑模式

// 获取路由过渡动画名称
const getTransitionName = (route: any) => {
  return route.meta?.transition || 'fade'
}

// 生命周期钩子
onMounted(async () => {
  try {
    // 初始化应用数据
    await initializeApp()
  } catch (error) {
    console.error('应用初始化失败:', error)
  } finally {
    // 关闭加载状态
    setTimeout(() => {
      isAppLoading.value = false
    }, 1000)
  }
})

// 初始化应用
const initializeApp = async () => {
  // 加载下载任务
  try {
    await downloadStore.loadAllTasks()
  } catch (error) {
    console.warn('加载下载任务失败:', error)
  }
  
  // 设置默认主题
  document.documentElement.classList.add('dark')
  
  // 设置页面标题
  document.title = '小说爬虫 - 发现你的下一本好书'
}

// 组件卸载时清理资源
import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {
  // 清理下载轮询
  downloadStore.cleanup()
})
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  overflow-x: hidden;
}

#app {
  height: 100%;
}

.app-container {
  position: relative;
  min-height: 100vh;
}

.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.app-content {
  min-height: 100vh;
}

.global-notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  pointer-events: none;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease-in-out;
}

.scale-enter-from {
  transform: scale(0.8);
  opacity: 0;
}

.scale-leave-to {
  transform: scale(1.2);
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-notifications {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* 选中文本样式 */
::selection {
  background: rgba(59, 130, 246, 0.3);
  color: #f8fafc;
}

::-moz-selection {
  background: rgba(59, 130, 246, 0.3);
  color: #f8fafc;
}
</style>
