import axios from 'axios'
import { useLoadingStore } from '@/stores/loading'
import type { 
  ApiResponse, 
  SearchResult, 
  SearchParams, 
  CatalogParams, 
  DownloadParams,
  DownloadStatus,
  TaskList
} from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const apiService = {
  // 搜索书籍
  async searchBooks(params: SearchParams): Promise<SearchResult[]> {
    const response = await api.get<ApiResponse<SearchResult[]>>('/search', { params })
    return response.data.data
  },

  // 获取书籍目录
  async getCatalog(params: CatalogParams): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>('/catalog', { params })
    return response.data.data
  },

  // 开始下载
  async startDownload(params: DownloadParams): Promise<string> {
    const response = await api.post<ApiResponse<string>>('/download/start', params)
    return response.data.data
  },

  // 获取下载状态
  async getDownloadStatus(taskId: string): Promise<DownloadStatus> {
    const response = await api.get<ApiResponse<DownloadStatus>>(`/download/status/${taskId}`)
    return response.data.data
  },

  // 获取所有任务
  async getTasks(): Promise<TaskList> {
    const response = await api.get<ApiResponse<TaskList>>('/download/tasks')
    return response.data.data
  },

  // 停止下载
  async stopDownload(taskId: string): Promise<void> {
    await api.post(`/download/stop/${taskId}`)
  },
}

export default apiService