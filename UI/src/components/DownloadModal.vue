<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="glass-card max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-100">确认下载</h3>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-slate-400">书籍名称</p>
          <p class="text-slate-100 font-medium">{{ book?.book_name }}</p>
        </div>
        
        <div>
          <p class="text-sm text-slate-400">作者</p>
          <p class="text-slate-100">{{ book?.author }}</p>
        </div>

        <div>
          <p class="text-sm text-slate-400">章节数量</p>
          <p class="text-slate-100">{{ catalog?.length || 0 }} 章</p>
        </div>

        <div class="bg-slate-800 p-4 rounded-lg">
          <p class="text-sm text-slate-400 mb-2">下载说明</p>
          <ul class="text-sm text-slate-300 space-y-1">
            <li>• 将下载完整书籍内容</li>
            <li>• 下载完成后可在"我的书库"查看</li>
            <li>• 可在"下载管理"中查看进度</li>
          </ul>
        </div>
      </div>

      <div class="flex space-x-3 mt-6">
        <button
          @click="$emit('close')"
          class="flex-1 btn-secondary"
        >
          取消
        </button>
        <button
          @click="confirmDownload"
          :disabled="isDownloading"
          class="flex-1 btn-primary disabled:opacity-50"
        >
          <span v-if="!isDownloading">确认下载</span>
          <span v-else>处理中...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Book } from '../types'

interface Props {
  book: Book | null
  catalog: string[]
}

defineProps<Props>()
defineEmits<{
  close: []
  confirm: [params: any]
}>()

const isDownloading = ref(false)

const confirmDownload = () => {
  isDownloading.value = true
  // 这里可以添加额外的下载参数
  const params = {
    bookName: props.book?.book_name,
    catalog: props.catalog
  }
  
  // 延迟一下让用户看到加载状态
  setTimeout(() => {
    emit('confirm', params)
  }, 500)
}
</script>