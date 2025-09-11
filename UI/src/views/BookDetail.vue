<template>
  <div class="max-w-4xl mx-auto">
    <!-- 返回按钮 -->
    <button
      @click="$router.back()"
      class="mb-6 text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
      <span>返回</span>
    </button>

    <!-- 书籍详情 -->
    <div v-if="currentBook" class="glass-card p-8 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- 封面 -->
        <div class="md:col-span-1">
          <div class="aspect-[3/4] bg-slate-700 rounded-lg overflow-hidden">
            <img
              v-if="currentBook.cover_url"
              :src="currentBook.cover_url"
              :alt="currentBook.book_name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-500">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- 信息 -->
        <div class="md:col-span-2">
          <h1 class="text-3xl font-bold text-slate-100 mb-4">{{ currentBook.book_name }}</h1>
          <p class="text-lg text-primary-400 mb-2">作者：{{ currentBook.author }}</p>
          <p class="text-slate-300 mb-6 leading-relaxed">{{ currentBook.description }}</p>
          
          <div v-if="currentBook.latest_chapter" class="mb-6">
            <span class="text-sm text-slate-400">最新章节：</span>
            <span class="text-sm text-primary-400">{{ currentBook.latest_chapter }}</span>
          </div>

          <button
            @click="showDownloadModal = true"
            class="btn-primary text-lg px-6 py-3 flex items-center space-x-2"
            :disabled="isLoadingCatalog"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <span>{{ isLoadingCatalog ? '加载中...' : '开始下载' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 目录列表 -->
    <div v-if="catalog.length > 0" class="glass-card p-6">
      <h2 class="text-xl font-semibold text-slate-100 mb-4">目录列表</h2>
      <div class="max-h-96 overflow-y-auto scrollbar-thin">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div
            v-for="(chapter, index) in catalog"
            :key="index"
            class="bg-slate-800 p-3 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {{ chapter }}
          </div>
        </div>
      </div>
    </div>

    <!-- 下载确认弹窗 -->
    <DownloadModal
      v-if="showDownloadModal"
      :book="currentBook"
      :catalog="catalog"
      @close="showDownloadModal = false"
      @confirm="handleDownload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBookStore } from '../stores/book'
import { useDownloadStore } from '../stores/download'
import { useNotificationStore } from '../stores/notification'
import { apiService } from '../services/api'
import DownloadModal from '../components/DownloadModal.vue'

const route = useRoute()
const bookStore = useBookStore()
const downloadStore = useDownloadStore()
const notificationStore = useNotificationStore()

const { currentBook, catalog } = storeToRefs(bookStore)
const showDownloadModal = ref(false)
const isLoadingCatalog = ref(false)

const bookName = computed(() => decodeURIComponent(route.params.bookName as string))

const loadCatalog = async () => {
  if (!currentBook.value) return
  
  isLoadingCatalog.value = true
  try {
    const catalogData = await apiService.getCatalog({
      keyword: bookStore.searchQuery || bookName.value,
      book_name: currentBook.value.book_name
    })
    bookStore.setCatalog(catalogData)
  } catch (error) {
    notificationStore.showError('获取目录失败')
  } finally {
    isLoadingCatalog.value = false
  }
}

const handleDownload = async (params: any) => {
  try {
    const taskId = await apiService.startDownload({
      keyword: bookStore.searchQuery || bookName.value,
      book_name: currentBook.value!.book_name
    })
    
    downloadStore.addTask({
      id: taskId,
      bookName: currentBook.value!.book_name,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    })
    
    notificationStore.showSuccess('下载任务已添加')
    showDownloadModal.value = false
  } catch (error) {
    notificationStore.showError('创建下载任务失败')
  }
}

onMounted(() => {
  loadCatalog()
})
</script>