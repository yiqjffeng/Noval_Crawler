<template>
  <div class="glass-card p-4">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="font-semibold text-slate-100 mb-1">{{ task.bookName }}</h3>
        <div class="text-sm text-slate-400">
          <span>{{ formatTime(task.createdAt) }}</span>
          <span class="mx-2">•</span>
          <span>{{ getStatusText(task.status) }}</span>
        </div>
        
        <!-- 进度条 -->
        <div v-if="task.status === 'downloading'" class="mt-3">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-slate-400">
              {{ task.downloadedChapters || 0 }} / {{ task.totalChapters || '?' }} 章
            </span>
            <span class="text-primary-400">{{ task.progress }}%</span>
          </div>
          <div class="w-full bg-slate-700 rounded-full h-2">
            <div 
              class="bg-primary-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${task.progress}%` }"
            ></div>
          </div>
          <p v-if="task.currentChapter" class="text-xs text-slate-400 mt-1">
            当前：{{ task.currentChapter }}
          </p>
        </div>

        <!-- 错误信息 -->
        <div v-if="task.error && task.status === 'failed'" class="mt-2">
          <p class="text-sm text-red-400">{{ task.error }}</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex space-x-2 ml-4">
        <button
          v-if="task.status === 'downloading'"
          @click="$emit('stop', task.id)"
          class="text-amber-400 hover:text-amber-300 transition-colors"
          title="停止"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
        
        <button
          v-if="task.status === 'failed'"
          @click="$emit('retry', task.id)"
          class="text-green-400 hover:text-green-300 transition-colors"
          title="重试"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>

        <button
          @click="$emit('remove', task.id)"
          class="text-red-400 hover:text-red-300 transition-colors"
          title="删除"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 状态指示器 -->
    <div class="mt-3 pt-3 border-t border-slate-700">
      <div class="flex items-center space-x-2">
        <div 
          class="w-2 h-2 rounded-full"
          :class="getStatusColor(task.status)"
        ></div>
        <span class="text-sm" :class="getStatusTextColor(task.status)">
          {{ getStatusText(task.status) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DownloadTask } from '../types'

interface Props {
  task: DownloadTask
}

defineProps<Props>()
defineEmits<{
  retry: [taskId: string]
  stop: [taskId: string]
  remove: [taskId: string]
}>()

const formatTime = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '等待中',
    downloading: '下载中',
    completed: '已完成',
    failed: '失败',
    stopped: '已停止'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'bg-amber-500',
    downloading: 'bg-primary-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    stopped: 'bg-gray-500'
  }
  return colorMap[status] || 'bg-gray-500'
}

const getStatusTextColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'text-amber-400',
    downloading: 'text-primary-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
    stopped: 'text-gray-400'
  }
  return colorMap[status] || 'text-gray-400'
}
</script>