<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-100">下载管理</h1>
      <button
        @click="clearCompleted"
        :disabled="completedTasks.length === 0"
        class="btn-secondary disabled:opacity-50"
      >
        清空已完成
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-primary-400">{{ activeTasks.length }}</div>
        <div class="text-sm text-slate-400">进行中</div>
      </div>
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-green-400">{{ completedTasks.length }}</div>
        <div class="text-sm text-slate-400">已完成</div>
      </div>
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-red-400">{{ failedTasks.length }}</div>
        <div class="text-sm text-slate-400">失败</div>
      </div>
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-slate-400">{{ tasks.length }}</div>
        <div class="text-sm text-slate-400">总计</div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="space-y-4">
      <div v-if="tasks.length === 0" class="glass-card p-12 text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <p class="text-slate-400 text-lg">暂无下载任务</p>
        <p class="text-sm text-slate-500">去搜索并下载一些书籍吧</p>
      </div>

      <DownloadTaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @retry="retryTask"
        @stop="stopTask"
        @remove="removeTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDownloadStore } from '../stores/download'
import { useNotificationStore } from '../stores/notification'
import { apiService } from '../services/api'
import DownloadTaskCard from '../components/DownloadTaskCard.vue'

const downloadStore = useDownloadStore()
const notificationStore = useNotificationStore()

const { tasks, activeTasks, completedTasks, failedTasks } = storeToRefs(downloadStore)

let refreshInterval: number | null = null

const loadTasks = async () => {
  try {
    const taskList = await apiService.getTasks()
    downloadStore.tasks = taskList.tasks
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
}

const refreshTaskStatus = async () => {
  const activeTaskIds = activeTasks.value.map(task => task.id)
  
  for (const taskId of activeTaskIds) {
    try {
      const status = await apiService.getDownloadStatus(taskId)
      downloadStore.updateTask(taskId, {
        status: status.status as any,
        progress: status.progress,
        currentChapter: status.current_chapter,
        totalChapters: status.total_chapters,
        downloadedChapters: status.downloaded_chapters,
        error: status.error
      })
    } catch (error) {
      console.error(`Failed to refresh task ${taskId}:`, error)
    }
  }
}

const clearCompleted = () => {
  downloadStore.clearCompleted()
}

const retryTask = async (taskId: string) => {
  // 这里可以实现重试逻辑
  notificationStore.showSuccess('重试功能开发中')
}

const stopTask = async (taskId: string) => {
  try {
    await apiService.stopDownload(taskId)
    downloadStore.updateTask(taskId, { status: 'stopped' })
    notificationStore.showSuccess('已停止下载')
  } catch (error) {
    notificationStore.showError('停止失败')
  }
}

const removeTask = (taskId: string) => {
  downloadStore.removeTask(taskId)
}

onMounted(() => {
  loadTasks()
  // 每3秒刷新一次任务状态
  refreshInterval = window.setInterval(refreshTaskStatus, 3000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>