import type { ApiResponse } from './common';

// 下载格式类型
export type DownloadFormat = 'txt' | 'epub';

// 下载状态类型
export type DownloadTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped' | 'paused';

// 下载请求参数
export interface DownloadRequest {
  novel_url: string;
  book_name: string;
  start_chapter: number;
  end_chapter: number;
  mode: DownloadFormat;
  output_path?: string;
  filename?: string;
}

// 下载任务状态
export interface DownloadStatus {
  task_id: string;
  status: DownloadTaskStatus;
  book_name: string;
  novel_url: string;
  start_chapter: number;
  end_chapter: number;
  current: number;
  total: number;
  percentage: number;
  failed_chapters: number[];
  created_at?: string;
  updated_at?: string;
  error_message?: string;
  download_speed?: string;
  estimated_time?: string;
}

// 开始下载响应
export interface StartDownloadResponse extends ApiResponse {
  task_id: string;
}

// 下载状态响应
export interface DownloadStatusResponse extends ApiResponse<DownloadStatus> {}

// 下载任务列表响应
export interface DownloadTasksResponse extends ApiResponse<DownloadStatus[]> {}

// 下载配置
export interface DownloadConfig {
  outputPath: string;
  format: DownloadFormat;
  startChapter: number;
  endChapter: number;
  fileName: string;
  overwriteExisting: boolean;
  autoRetry: boolean;
}

// 下载统计信息
export interface DownloadStats {
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
}

// 失败章节重试信息
export interface FailedChapterInfo {
  chapterNumber: number;
  chapterTitle: string;
  errorReason: string;
  retryCount: number;
  lastRetryTime: string;
}

// 下载进度详情
export interface DownloadProgress {
  taskId: string;
  bookName: string;
  currentChapter: number;
  totalChapters: number;
  percentage: number;
  speed: string;
  remainingTime: string;
  failedChapters: FailedChapterInfo[];
  isRetrying: boolean;
}

// 批量操作类型
export type BatchOperation = 'start' | 'stop' | 'pause' | 'resume' | 'delete';

// 批量操作请求
export interface BatchOperationRequest {
  operation: BatchOperation;
  task_ids: string[];
}