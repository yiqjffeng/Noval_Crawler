<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- 顶部导航 -->
    <nav class="glass-card sticky top-0 z-50 mx-4 mt-4">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-primary-400">青墨书阁</h1>
          <div class="hidden md:flex space-x-6">
            <router-link 
              to="/" 
              class="text-slate-300 hover:text-primary-400 transition-colors"
              active-class="text-primary-400"
            >
              搜索
            </router-link>
            <router-link 
              to="/downloads" 
              class="text-slate-300 hover:text-primary-400 transition-colors"
              active-class="text-primary-400"
            >
              下载管理
            </router-link>
            <router-link 
              to="/library" 
              class="text-slate-300 hover:text-primary-400 transition-colors"
              active-class="text-primary-400"
            >
              我的书库
            </router-link>
          </div>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <button 
          @click="toggleMobileMenu"
          class="md:hidden text-slate-300 hover:text-primary-400"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
      
      <!-- 移动端菜单 -->
      <div v-if="showMobileMenu" class="md:hidden px-6 pb-4">
        <div class="space-y-2">
          <router-link 
            to="/" 
            @click="toggleMobileMenu"
            class="block text-slate-300 hover:text-primary-400 transition-colors"
          >
            搜索
          </router-link>
          <router-link 
            to="/downloads" 
            @click="toggleMobileMenu"
            class="block text-slate-300 hover:text-primary-400 transition-colors"
          >
            下载管理
          </router-link>
          <router-link 
            to="/library" 
            @click="toggleMobileMenu"
            class="block text-slate-300 hover:text-primary-400 transition-colors"
          >
            我的书库
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>

    <!-- 全局通知 -->
    <NotificationContainer />
    
    <!-- 全局加载动画 -->
    <GlobalLoading />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NotificationContainer from './components/NotificationContainer.vue'
import GlobalLoading from './components/GlobalLoading.vue'

const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}
</script>