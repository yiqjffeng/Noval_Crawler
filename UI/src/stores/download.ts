import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DownloadTask } from '../types'

export const useDownloadStore = defineStore('download', () => {
  const tasks = ref<DownloadTask[]>([])
  const isLoading = ref(false)

  const activeTasks = computed(() => 
    tasks.value.filter(task => task.status === 'downloading' || task.status === 'pending')
  )

  const completedTasks = computed(() => 
    tasks.value.filter(task => task.status === 'completed')
  )

  const failedTasks = computed(() => 
    tasks.value.filter(task => task.status === 'failed')
  )

  const addTask = (task: DownloadTask) => {
    tasks.value.push(task)
  }

  const updateTask = (taskId: string, updates: Partial<DownloadTask>) => {
    const index = tasks.value.findIndex(task => task.id === taskId)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates }
    }
  }

  const removeTask = (taskId: string) => {
    tasks.value = tasks.value.filter(task => task.id !== taskId)
  }

  const clearCompleted = () => {
    tasks.value = tasks.value.filter(task => task.status !== 'completed')
  }

  return {
    tasks,
    isLoading,
    activeTasks,
    completedTasks,
    failedTasks,
    addTask,
    updateTask,
    removeTask,
    clearCompleted,
  }
})