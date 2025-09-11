<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-100">我的书库</h1>
      <div class="flex space-x-4">
        <select v-model="sortBy" class="input-field">
          <option value="name">按名称排序</option>
          <option value="author">按作者排序</option>
          <option value="date">按时间排序</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索书籍..."
          class="input-field w-64"
        />
      </div>
    </div>

    <!-- 书籍网格 -->
    <div v-if="filteredBooks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <BookCard
        v-for="book in filteredBooks"
        :key="book.book_name"
        :book="book"
        @click="openBook(book)"
        @download="openBook(book)"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="glass-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
      </svg>
      <p class="text-slate-400 text-lg">书库为空</p>
      <p class="text-sm text-slate-500">完成下载的书籍会显示在这里</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SearchResult } from '../types'
import BookCard from '../components/BookCard.vue'

// 模拟数据 - 实际应用中应该从后端获取
const books = ref<SearchResult[]>([
  {
    book_name: '示例小说1',
    author: '示例作者',
    description: '这是一本示例小说的简介，展示了书库中的书籍信息。',
    url: 'https://example.com/book1',
    cover_url: 'https://via.placeholder.com/300x400/1e293b/64748b?text=Book1'
  },
  {
    book_name: '示例小说2',
    author: '另一位作者',
    description: '另一本示例小说的简介，用于展示书库功能。',
    url: 'https://example.com/book2',
    cover_url: 'https://via.placeholder.com/300x400/1e293b/64748b?text=Book2'
  }
])

const searchQuery = ref('')
const sortBy = ref('name')

const filteredBooks = computed(() => {
  let filtered = books.value
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(book => 
      book.book_name.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    )
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.book_name.localeCompare(b.book_name)
      case 'author':
        return a.author.localeCompare(b.author)
      case 'date':
        return 0 // 实际应用中应该按下载时间排序
      default:
        return 0
    }
  })
  
  return filtered
})

const openBook = (book: SearchResult) => {
  // 实际应用中应该打开阅读器或文件
  console.log('Opening book:', book.book_name)
}

onMounted(() => {
  // 实际应用中应该从后端加载已下载的书籍列表
})
</script>