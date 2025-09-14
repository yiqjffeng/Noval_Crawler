<template>
  <div class="tasks-view">
    <div class="tasks-container">
      <div class="tasks-header">
        <div class="header-nav">
          <BaseButton variant="ghost" size="small" @click="goBack">
            <ArrowLeftIcon class="w-4 h-4 mr-1" />
            返回
          </BaseButton>
          <h1 class="tasks-title">下载任务</h1>
        </div>
        <BaseButton 
          v-if="!isLoading"
          variant="secondary"
          size="small"
          @click="refreshTasks"
          :disabled="isRefreshing"
        >
          <ArrowPathIcon class="refresh-icon" :class="{ 'animate-spin': isRefreshing }" />
          刷新
        </BaseButton>
      </div>
      
      <!-- 统计信息 -->
      <div v-if="!isLoading && tasks.length > 0" class="stats-section">
        <div class="stat-card">
          <div class="stat-number">{{ downloadStats.totalTasks }}</div>
          <div class="stat-label">总任务</div>
        </div>
        <div class="stat-card">
          <div class="stat-number running">{{ downloadStats.runningTasks }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-card">
          <div class="stat-number completed">{{ downloadStats.completedTasks }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-card">
          <div class="stat-number failed">{{ downloadStats.failedTasks }}</div>
          <div class="stat-label">失败</div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-section">
        <WizardLoader text="正在加载任务列表..." :fullscreen="false" />
      </div>
      
      <!-- 任务列表 -->
      <div v-else-if="tasks.length > 0" class="tasks-list">
        <div 
          v-for="task in tasks" 
          :key="task.task_id"
          class="task-card"
          :class="{ 'completed': task.status === 'completed', 'failed': task.status === 'failed' }"
        >
          <div class="task-header">
            <div class="task-info">
              <h3 class="task-title">{{ task.book_name }}</h3>
              <span class="task-time">创建于 {{ formatTime(task.created_at) }}</span>
            </div>
            <span :class="['task-status', task.status]">
              {{ getStatusText(task.status) }}
            </span>
          </div>
          
          <div class="task-details">
            <div class="task-url" :title="task.novel_url">
              <LinkIcon class="url-icon" />
              {{ truncateUrl(task.novel_url) }}
            </div>
            <div class="task-range">
              章节范围: {{ task.start_chapter }} - {{ task.end_chapter }}
            </div>
          </div>
          
          <div class="task-progress">
            <div class="progress-info">
              <span class="progress-text">{{ getTaskProgress(task) }}%</span>
              <span class="progress-detail">
                {{ task.current }}/{{ task.total }} 章节
              </span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :class="task.status"
                :style="{ width: `${getTaskProgress(task)}%` }"
              ></div>
            </div>
          </div>
          
          <div v-if="task.failed_chapters && task.failed_chapters.length > 0" class="failed-chapters">
            <div class="failed-title">
              <ExclamationTriangleIcon class="failed-icon" />
              失败章节: {{ task.failed_chapters.length }} 个
            </div>
            <div class="failed-list">
              <span v-for="chapter in task.failed_chapters.slice(0, 5)" :key="chapter" class="failed-item">
                第{{ chapter }}章
              </span>
              <span v-if="task.failed_chapters.length > 5" class="failed-more">
                +{{ task.failed_chapters.length - 5 }} 更多
              </span>
            </div>
          </div>
          
          <div class="task-actions">
            <BaseButton 
              v-if="task.status === 'running'"
              variant="ghost"
              size="small"
              @click="stopTask(task.task_id)"
              :loading="loadingActions[task.task_id]"
            >
              停止
            </BaseButton>
            <BaseButton 
              v-if="task.status === 'failed' && task.failed_chapters.length > 0"
              variant="secondary"
              size="small"
              @click="retryFailed(task.task_id)"
              :loading="loadingActions[task.task_id]"
            >
              重试失败
            </BaseButton>
            <BaseButton 
              v-if="task.status === 'stopped'"
              variant="primary"
              size="small"
              @click="resumeTask(task.task_id)"
              :loading="loadingActions[task.task_id]"
            >
              继续
            </BaseButton>
            <BaseButton 
              variant="danger"
              size="small"
              @click="deleteTask(task.task_id)"
              :loading="loadingActions[task.task_id]"
            >
              删除
            </BaseButton>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <BookOpenIcon class="empty-icon" />
        <h3 class="empty-title">暂无下载任务</h3>
        <p class="empty-text">开始下载小说后，任务会显示在这里</p>
        <BaseButton 
          variant="primary"
          size="medium"
          @click="goToSearch"
        >
          去搜索小说
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoading } from '@/composables/useLoading'
import { WizardLoader } from '@/components/loading'
import { BookOpenIcon, ArrowPathIcon, LinkIcon, ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/common/BaseButton.vue'
import { useDownloadStore } from '@/stores/download'
import type { DownloadStatus } from '@/types/download'

const router = useRouter()
const downloadStore = useDownloadStore()
const { isLoading, withLoading } = useLoading()

const isRefreshing = ref(false)
const loadingActions = ref<Record<string, boolean>>({})

// 计算属性
const tasks = computed(() => downloadStore.allTasks)
const downloadStats = computed(() => downloadStore.downloadStats)

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    running: '下载中',
    stopped: '已停止',
    completed: '已完成',
    failed: '下载失败',
    pending: '等待中',
    paused: '已暂停'
  }
  return statusMap[status] || status
}

// 格式化时间
const formatTime = (timeString?: string) => {
  if (!timeString) return '未知'
  try {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '未知'
  }
}

// 截断URL显示
const truncateUrl = (url: string) => {
  if (!url) return '未知链接'
  return url.length > 50 ? url.substring(0, 50) + '...' : url
}

// 计算任务进度百分比
const getTaskProgress = (task: DownloadStatus): number => {
  // 已完成任务强制返回100%
  if (task.status === 'completed') {
    return 100
  }
  
  // 优先使用percentage字段
  if (task.percentage > 0) {
    return Math.min(task.percentage, 100)
  }
  
  // 使用current/total计算
  if (task.current > 0 && task.total > 0) {
    return Math.min(Math.round((task.current / task.total) * 100), 100)
  }
  
  return 0
}

// 设置加载状态
const setActionLoading = (taskId: string, loading: boolean) => {
  loadingActions.value[taskId] = loading
}

// 加载任务列表
const loadTasks = async () => {
  await downloadStore.loadAllTasks()
}

// 刷新任务列表
const refreshTasks = async () => {
  isRefreshing.value = true
  try {
    await downloadStore.loadAllTasks()
  } finally {
    isRefreshing.value = false
  }
}

// 任务操作
const stopTask = async (taskId: string) => {
  setActionLoading(taskId, true)
  try {
    await downloadStore.stopDownloadTask(taskId)
  } finally {
    setActionLoading(taskId, false)
  }
}

const resumeTask = async (taskId: string) => {
  setActionLoading(taskId, true)
  try {
    await downloadStore.performBatchOperation('start', [taskId])
  } finally {
    setActionLoading(taskId, false)
  }
}

const deleteTask = async (taskId: string) => {
  if (!confirm('确定要删除这个任务吗？')) return
  
  setActionLoading(taskId, true)
  try {
    await downloadStore.performBatchOperation('delete', [taskId])
  } finally {
    setActionLoading(taskId, false)
  }
}

const retryFailed = async (taskId: string) => {
  setActionLoading(taskId, true)
  try {
    await downloadStore.retryFailedChaptersForTask(taskId)
  } finally {
    setActionLoading(taskId, false)
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: 'Search' })
  }
}

const goToSearch = () => {
  router.push('/')
}

// 自动刷新定时器
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await withLoading(loadTasks)
  
  // 设置自动刷新（每10秒）
  refreshInterval = setInterval(() => {
    if (!isRefreshing.value) {
      downloadStore.loadAllTasks()
    }
  }, 10000)
})

onUnmounted(() => {
  // 清理定时器
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  // 清理store
  downloadStore.cleanup()
})
</script>

<style scoped>
.tasks-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 2rem;
}

.tasks-container {
  max-width: 1000px;
  margin: 0 auto;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tasks-title {
  color: #f8fafc;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.refresh-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.stat-number {
  color: #f8fafc;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-number.running {
  color: #22c55e;
}

.stat-number.completed {
  color: #3b82f6;
}

.stat-number.failed {
  color: #ef4444;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

.loading-section {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.task-skeleton {
  width: 100%;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.task-card {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.task-card.completed {
  border-color: rgba(59, 130, 246, 0.3);
}

.task-card.failed {
  border-color: rgba(239, 68, 68, 0.3);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-info {
  flex: 1;
}

.task-title {
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.task-time {
  color: #64748b;
  font-size: 0.875rem;
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.task-status.running {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.task-status.stopped {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.task-status.completed {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.task-status.failed {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.task-status.pending {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.task-details {
  margin-bottom: 1rem;
}

.task-url {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.url-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.task-range {
  color: #94a3b8;
  font-size: 0.875rem;
}

.task-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
}

.progress-text {
  font-weight: 600;
  color: #f8fafc;
}

.progress-bar {
  height: 8px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-fill.running {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.progress-fill.completed {
  background: linear-gradient(90deg, #10b981, #059669);
  animation: completion-pulse 1s ease-in-out;
}

.progress-fill.failed {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.progress-fill.stopped {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.progress-fill.pending {
  background: linear-gradient(90deg, #94a3b8, #64748b);
}

@keyframes completion-pulse {
  0% { 
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); 
  }
  70% { 
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); 
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); 
  }
}

.failed-chapters {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border-left: 3px solid #ef4444;
}

.failed-title {
  display: flex;
  align-items: center;
  color: #f87171;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.failed-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.failed-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.failed-item {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.failed-more {
  color: #94a3b8;
  font-size: 0.75rem;
  align-self: center;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #64748b;
  margin: 0 auto 1rem;
}

.empty-title {
  color: #f8fafc;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #94a3b8;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .tasks-view {
    padding: 1rem;
  }
  
  .tasks-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .task-actions {
    flex-direction: column;
  }
  
  .failed-list {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>