export interface Book {
  book_name: string
  author: string
  description: string
  url: string
  latest_chapter?: string
  cover_url?: string
}

export interface SearchResult {
  book_name: string
  author: string
  description: string
  url: string
  latest_chapter?: string
  cover_url?: string
}

export interface DownloadTask {
  id: string
  bookName: string
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'stopped'
  progress: number
  currentChapter?: string
  totalChapters?: number
  downloadedChapters?: number
  error?: string
  createdAt: Date
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface SearchParams {
  keyword: string
}

export interface CatalogParams {
  keyword: string
  book_name: string
}

export interface DownloadParams {
  keyword: string
  book_name: string
}

export interface DownloadStatus {
  task_id: string
  status: string
  progress: number
  current_chapter?: string
  total_chapters?: number
  downloaded_chapters?: number
  error?: string
}

export interface TaskList {
  tasks: DownloadTask[]
}