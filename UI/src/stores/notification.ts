import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '../types'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    notifications.value.push({
      ...notification,
      id,
    })

    // 3秒后自动移除
    setTimeout(() => {
      removeNotification(id)
    }, 3000)
  }

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const showSuccess = (message: string) => {
    addNotification({
      type: 'success',
      message,
    })
  }

  const showError = (message: string) => {
    addNotification({
      type: 'error',
      message,
    })
  }

  const showWarning = (message: string) => {
    addNotification({
      type: 'warning',
      message,
    })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
  }
})