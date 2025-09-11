<template>
  <div class="max-w-6xl mx-auto">
    <!-- 搜索区域 -->
    <div class="glass-card p-8 mb-8">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-primary-400 mb-2">青墨书阁</h2>
        <p class="text-slate-400">探索海量小说，一键下载阅读</p>
      </div>
      
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="输入小说名称或作者搜索..."
            class="input-field w-full text-lg py-3 pl-12 pr-4"
          />
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <button
            @click="handleSearch"
            :disabled="isSearching || !searchQuery.trim()"
            class="absolute right-2 top-1/2 -translate-y-1/2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isSearching">搜索</span>
            <LoadingSpinner v-else />
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="fade-in">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-slate-200">
          搜索结果 ({{ searchResults.length }})
        </h3>
        <button
          @click="clearSearch"
          class="text-slate-400 hover:text-slate-200 transition-colors"
        >
          清空结果
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BookCard
          v-for="book in searchResults"
          :key="book.book_name"
          :book="book"
          @click="viewBook(book)"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!isSearching && searchQuery.trim() === ''" class="text-center py-16">
      <div class="text-slate-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        <p class="text-lg">开始你的阅读之旅</p>
        <p class="text-sm text-slate-500">输入小说名称开始搜索</p>
      </div>
    </div>

    <!-- 搜索错误状态 -->
    <div v-else-if="searchError" class="text-center py-16">
      <div class="text-red-400">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-lg">搜索失败</p>
        <p class="text-sm text-slate-500">{{ searchError }}</p>
        <button
          @click="handleSearch"
          class="mt-4 btn-primary"
        >
          重试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBookStore } from '../stores/book'
import { useNotificationStore } from '../stores/notification'
import { useLoadingStore } from '../stores/loading'
import { apiService } from '../services/api'
import BookCard from '../components/BookCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const bookStore = useBookStore()
const notificationStore = useNotificationStore()
const loadingStore = useLoadingStore()

const { searchResults } = storeToRefs(bookStore)
const searchQuery = ref('')
const isSearching = ref(false)
const searchError = ref('')

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  isSearching.value = true
  searchError.value = ''
  
  try {
    const results = await apiService.searchBooks({ keyword: searchQuery.value })
    bookStore.setSearchResults(results)
    bookStore.searchQuery = searchQuery.value
    
    if (results.length === 0) {
      notificationStore.showWarning('未找到相关书籍')
    }
  } catch (error) {
    searchError.value = '搜索失败，请稍后重试'
    notificationStore.showError('搜索失败')
  } finally {
    isSearching.value = false
  }
}

const viewBook = (book: any) => {
  bookStore.setCurrentBook(book)
  router.push(`/book/${encodeURIComponent(book.book_name)}`)
}

const clearSearch = () => {
  bookStore.clearSearch()
  searchQuery.value = ''
}
</script>