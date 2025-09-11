import { createPinia } from 'pinia'
import { useBookStore } from './book'
import { useDownloadStore } from './download'
import { useNotificationStore } from './notification'
import { useLoadingStore } from './loading'

export const pinia = createPinia()

export { useBookStore, useDownloadStore, useNotificationStore, useLoadingStore }