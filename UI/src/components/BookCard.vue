<template>
  <div 
    class="glass-card hover-glow p-6 cursor-pointer transition-all duration-300"
    @click="$emit('click')"
  >
    <!-- 封面图片 -->
    <div class="aspect-[3/4] bg-slate-700 rounded-lg mb-4 overflow-hidden">
      <img
        v-if="book.cover_url"
        :src="book.cover_url"
        :alt="book.book_name"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-slate-500">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      </div>
    </div>

    <!-- 书籍信息 -->
    <div class="space-y-2">
      <h3 class="text-lg font-semibold text-slate-100 line-clamp-1">
        {{ book.book_name }}
      </h3>
      <p class="text-sm text-slate-400">
        <span class="text-primary-400">作者：</span>{{ book.author }}
      </p>
      <p class="text-sm text-slate-400 line-clamp-3">
        {{ book.description }}
      </p>
      <div v-if="book.latest_chapter" class="text-xs text-primary-400">
        最新：{{ book.latest_chapter }}
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-4 pt-4 border-t border-slate-700">
      <button
        @click.stop="$emit('download')"
        class="w-full btn-primary flex items-center justify-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <span>查看详情</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchResult } from '../types'

interface Props {
  book: SearchResult
}

defineProps<Props>()
defineEmits<{
  click: []
  download: []
}>()

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>