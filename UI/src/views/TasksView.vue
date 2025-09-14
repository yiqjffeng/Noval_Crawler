<template>
  <div class="tasks-view">
    <div class="tasks-container">
      <h1 class="tasks-title">下载任务</h1>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-section">
        <SkeletonLoader 
          type="list"
          :count="3"
          :animated="true"
          class="task-skeleton"
        />
      </div>
      
      <!-- 任务列表 -->
      <div v-else-if="tasks.length > 0" class="tasks-list">
        <div 
          v-for="task in tasks" 
          :key="task.id"
          class="task-card"
        >
          <div class="task-header">
            <h3 class="task-title">{{ task.bookName }}</h3>
            <span :class="['task-status', task.status]">
              {{ getStatusText(task.status) }}
            </span>
          </div>
          
          <div class="task-progress">
            <div class="progress-info">
              <span class="progress-text">{{ task.progress }}%</span>
              <span class="progress-detail">{{ task.completed }}/{{ task.total }} 章节</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${task.progress}%` }"
              ></div>
            </div>
          </div>
          
          <div class="task-actions">
            <BaseButton 
              v-if="task.status === 'paused'"
              variant="primary"
              size="small"
              @click="resumeTask(task.id)"
            >
              继续
            </BaseButton>
            <BaseButton 
              v-if="task.status === 'downloading'"
              variant="ghost"
              size="small"
              @click="pauseTask(task.id)"
            >
              暂停
            </BaseButton>
            <BaseButton 
              variant="danger"
              size="small"
              @click="cancelTask(task.id)"
            >
              取消
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
          size="large"
          @click="goToSearch"
        >
          去搜索小说
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoading } from '@/composables/useLoading'
import { SkeletonLoader } from '@/components/loading'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/base/BaseButton.vue'

interface DownloadTask {
  id: string
  bookName: string
  status: 'downloading' | 'paused' | 'completed' | 'error'
  progress: number
  completed: number
  total: number
}

const router = useRouter()
const { isLoading, withLoading } = useLoading()

const tasks = ref<DownloadTask[]>([])

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    downloading: '下载中',
    paused: '已暂停',
    completed: '已完成',
    error: '下载失败'
  }
  return statusMap[status] || status
}

// 加载任务列表
const loadTasks = async () => {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  tasks.value = [
    {
      id: '1',
      bookName: '斗破苍穹',
      status: 'downloading',
      progress: 65,
      completed: 130,
      total: 200
    },
    {
      id: '2',
      bookName: '完美世界',
      status: 'paused',
      progress: 30,
      completed: 60,
      total: 200
    },
    {
      id: '3',
      bookName: '遮天',
      status: 'completed',
      progress: 100,
      completed: 150,
      total: 150
    }
  ]
}

// 任务操作
const resumeTask = (taskId: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) task.status = 'downloading'
}

const pauseTask = (taskId: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) task.status = 'paused'
}

const cancelTask = (taskId: string) => {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
}

const goToSearch = () => {
  router.push('/')
}

onMounted(() => {
  withLoading(loadTasks)
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

.tasks-title {
  color: #f8fafc;
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 700;
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

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.task-title {
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.task-status.downloading {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.task-status.paused {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.task-status.completed {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.task-status.error {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
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
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
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
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .task-actions {
    flex-direction: column;
  }
}
</style>