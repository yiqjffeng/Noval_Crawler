import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  startDownload as startDownloadAPI,
  getDownloadStatus,
  stopDownload,
  getDownloadTasks,
  batchOperation,
  retryFailedChapters
} from '@/api/download';
import { storage } from '@/utils';
import type { 
  DownloadRequest,
  DownloadStatus,
  DownloadTaskStatus,
  DownloadConfig,
  DownloadStats,
  DownloadProgress,
  BatchOperationRequest,
  LoadingState,
  ErrorState 
} from '@/types';

const STORAGE_KEYS = {
  DOWNLOAD_CONFIG: 'book_crawler_download_config',
  DOWNLOAD_HISTORY: 'book_crawler_download_history'
};

const DEFAULT_CONFIG: DownloadConfig = {
  outputPath: './downloads',
  format: 'txt',
  startChapter: 1,
  endChapter: 999999,
  fileName: '{bookName}',
  overwriteExisting: false,
  autoRetry: true
};

export const useDownloadStore = defineStore('download', () => {
  // 状态
  const downloadTasks = ref<Map<string, DownloadStatus>>(new Map());
  const currentTaskId = ref<string | null>(null);
  const downloadConfig = ref<DownloadConfig>(
    storage.get<DownloadConfig>(STORAGE_KEYS.DOWNLOAD_CONFIG, DEFAULT_CONFIG)
  );
  
  const loadingState = ref<LoadingState>({
    isLoading: false,
    loadingText: ''
  });

  const errorState = ref<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0
  });

  // 轮询定时器
  const pollTimers = ref<Map<string, NodeJS.Timeout>>(new Map());

  // 计算属性
  const allTasks = computed(() => Array.from(downloadTasks.value.values()));
  
  const runningTasks = computed(() => 
    allTasks.value.filter(task => task.status === 'running')
  );
  
  const completedTasks = computed(() => 
    allTasks.value.filter(task => task.status === 'completed')
  );
  
  const failedTasks = computed(() => 
    allTasks.value.filter(task => task.status === 'failed')
  );

  const pendingTasks = computed(() => 
    allTasks.value.filter(task => task.status === 'pending')
  );

  const currentTask = computed(() => 
    currentTaskId.value ? downloadTasks.value.get(currentTaskId.value) : null
  );

  const downloadStats = computed((): DownloadStats => ({
    totalTasks: allTasks.value.length,
    runningTasks: runningTasks.value.length,
    completedTasks: completedTasks.value.length,
    failedTasks: failedTasks.value.length,
    successRate: allTasks.value.length > 0 
      ? Math.round((completedTasks.value.length / allTasks.value.length) * 100) 
      : 0
  }));

  const isDownloading = computed(() => loadingState.value.isLoading);
  const hasError = computed(() => errorState.value.hasError);
  const hasActiveTasks = computed(() => runningTasks.value.length > 0);

  // Actions
  const startDownload = async (params: DownloadRequest): Promise<string | null> => {
    setLoading(true, '正在创建下载任务...');
    clearError();

    try {
      const response = await startDownloadAPI(params);
      
      if (response.status === 'success' && response.task_id) {
        const taskId = response.task_id;
        currentTaskId.value = taskId;
        
        // 创建初始任务状态
        const initialStatus: DownloadStatus = {
          task_id: taskId,
          status: 'pending',
          book_name: params.book_name,
          novel_url: params.novel_url,
          start_chapter: params.start_chapter,
          end_chapter: params.end_chapter,
          current: 0,
          total: params.end_chapter - params.start_chapter + 1,
          percentage: 0,
          failed_chapters: [],
          created_at: new Date().toISOString()
        };
        
        downloadTasks.value.set(taskId, initialStatus);
        
        // 开始轮询状态
        startPolling(taskId);
        
        clearError();
        return taskId;
      } else {
        throw new Error(response.message || '创建下载任务失败');
      }
    } catch (error: any) {
      console.error('开始下载失败:', error);
      setError({
        code: 'START_DOWNLOAD_ERROR',
        message: error.message || '开始下载失败，请稍后重试',
        details: error
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const stopDownloadTask = async (taskId: string): Promise<boolean> => {
    try {
      const response = await stopDownload(taskId);
      
      if (response.status === 'success') {
        // 停止轮询
        stopPolling(taskId);
        
        // 更新任务状态
        const task = downloadTasks.value.get(taskId);
        if (task) {
          task.status = 'stopped';
          task.updated_at = new Date().toISOString();
          downloadTasks.value.set(taskId, task);
        }
        
        return true;
      } else {
        throw new Error(response.message || '停止下载失败');
      }
    } catch (error: any) {
      console.error('停止下载失败:', error);
      setError({
        code: 'STOP_DOWNLOAD_ERROR',
        message: error.message || '停止下载失败',
        details: error
      });
      return false;
    }
  };

  const loadAllTasks = async (): Promise<void> => {
    setLoading(true, '正在加载下载任务...');
    
    try {
      const response = await getDownloadTasks();
      
      if (response.status === 'success' && response.data) {
        // 清空现有任务
        downloadTasks.value.clear();
        
        // 添加新任务
        response.data.forEach(task => {
          downloadTasks.value.set(task.task_id, task);
          
          // 为运行中的任务启动轮询
          if (task.status === 'running') {
            startPolling(task.task_id);
          }
        });
        
        clearError();
      } else {
        throw new Error(response.message || '加载任务列表失败');
      }
    } catch (error: any) {
      console.error('加载任务列表失败:', error);
      setError({
        code: 'LOAD_TASKS_ERROR',
        message: error.message || '加载任务列表失败',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshTaskStatus = async (taskId: string): Promise<void> => {
    try {
      const response = await getDownloadStatus(taskId);
      
      if (response.status === 'success' && response.data) {
        downloadTasks.value.set(taskId, response.data);
        
        // 如果任务已完成或失败，停止轮询
        if (['completed', 'failed', 'stopped'].includes(response.data.status)) {
          stopPolling(taskId);
        }
      }
    } catch (error: any) {
      console.error(`刷新任务状态失败 (${taskId}):`, error);
      
      // 如果任务不存在，从列表中移除
      if (error.status === 404) {
        downloadTasks.value.delete(taskId);
        stopPolling(taskId);
      }
    }
  };

  const startPolling = (taskId: string): void => {
    // 如果已经在轮询，先停止
    stopPolling(taskId);
    
    const timer = setInterval(async () => {
      await refreshTaskStatus(taskId);
    }, 2000); // 每2秒轮询一次
    
    pollTimers.value.set(taskId, timer);
  };

  const stopPolling = (taskId: string): void => {
    const timer = pollTimers.value.get(taskId);
    if (timer) {
      clearInterval(timer);
      pollTimers.value.delete(taskId);
    }
  };

  const stopAllPolling = (): void => {
    pollTimers.value.forEach(timer => clearInterval(timer));
    pollTimers.value.clear();
  };

  const performBatchOperation = async (
    operation: BatchOperationRequest['operation'],
    taskIds: string[]
  ): Promise<boolean> => {
    try {
      const response = await batchOperation({ operation, task_ids: taskIds });
      
      if (response.status === 'success') {
        // 根据操作类型更新任务状态
        taskIds.forEach(taskId => {
          const task = downloadTasks.value.get(taskId);
          if (task) {
            switch (operation) {
              case 'stop':
                task.status = 'stopped';
                stopPolling(taskId);
                break;
              case 'start':
                task.status = 'running';
                startPolling(taskId);
                break;
              case 'delete':
                downloadTasks.value.delete(taskId);
                stopPolling(taskId);
                return;
            }
            task.updated_at = new Date().toISOString();
            downloadTasks.value.set(taskId, task);
          }
        });
        
        return true;
      } else {
        throw new Error(response.message || '批量操作失败');
      }
    } catch (error: any) {
      console.error('批量操作失败:', error);
      setError({
        code: 'BATCH_OPERATION_ERROR',
        message: error.message || '批量操作失败',
        details: error
      });
      return false;
    }
  };

  const retryFailedChaptersForTask = async (
    taskId: string, 
    chapterNumbers?: number[]
  ): Promise<boolean> => {
    try {
      const task = downloadTasks.value.get(taskId);
      if (!task) {
        throw new Error('任务不存在');
      }

      const chaptersToRetry = chapterNumbers || task.failed_chapters;
      if (chaptersToRetry.length === 0) {
        throw new Error('没有需要重试的章节');
      }

      const response = await retryFailedChapters(taskId, chaptersToRetry);
      
      if (response.status === 'success') {
        // 重新开始轮询
        task.status = 'running';
        task.updated_at = new Date().toISOString();
        downloadTasks.value.set(taskId, task);
        startPolling(taskId);
        
        return true;
      } else {
        throw new Error(response.message || '重试失败章节失败');
      }
    } catch (error: any) {
      console.error('重试失败章节失败:', error);
      setError({
        code: 'RETRY_CHAPTERS_ERROR',
        message: error.message || '重试失败章节失败',
        details: error
      });
      return false;
    }
  };

  const updateDownloadConfig = (config: Partial<DownloadConfig>): void => {
    downloadConfig.value = { ...downloadConfig.value, ...config };
    storage.set(STORAGE_KEYS.DOWNLOAD_CONFIG, downloadConfig.value);
  };

  const resetDownloadConfig = (): void => {
    downloadConfig.value = { ...DEFAULT_CONFIG };
    storage.set(STORAGE_KEYS.DOWNLOAD_CONFIG, downloadConfig.value);
  };

  const getTaskProgress = (taskId: string): DownloadProgress | null => {
    const task = downloadTasks.value.get(taskId);
    if (!task) return null;

    return {
      taskId: task.task_id,
      bookName: task.book_name,
      currentChapter: task.current,
      totalChapters: task.total,
      percentage: task.percentage,
      speed: task.download_speed || '0 KB/s',
      remainingTime: task.estimated_time || '未知',
      failedChapters: task.failed_chapters.map(chapterNum => ({
        chapterNumber: chapterNum,
        chapterTitle: `第${chapterNum}章`,
        errorReason: '下载失败',
        retryCount: 0,
        lastRetryTime: ''
      })),
      isRetrying: task.status === 'running' && task.failed_chapters.length > 0
    };
  };

  const removeTask = (taskId: string): void => {
    stopPolling(taskId);
    downloadTasks.value.delete(taskId);
    
    if (currentTaskId.value === taskId) {
      currentTaskId.value = null;
    }
  };

  const setLoading = (isLoading: boolean, loadingText?: string): void => {
    loadingState.value = {
      isLoading,
      loadingText: loadingText || ''
    };
  };

  const setError = (error: { code: string; message: string; details?: any }): void => {
    errorState.value = {
      hasError: true,
      error,
      retryCount: errorState.value.retryCount + 1
    };
  };

  const clearError = (): void => {
    errorState.value = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  };

  const setCurrentTask = (taskId: string | null): void => {
    currentTaskId.value = taskId;
  };

  const reset = (): void => {
    stopAllPolling();
    downloadTasks.value.clear();
    currentTaskId.value = null;
    clearError();
    setLoading(false);
  };

  // 清理函数 - 组件卸载时调用
  const cleanup = (): void => {
    stopAllPolling();
  };

  return {
    // 状态
    downloadTasks,
    currentTaskId,
    downloadConfig,
    loadingState,
    errorState,
    
    // 计算属性
    allTasks,
    runningTasks,
    completedTasks,
    failedTasks,
    pendingTasks,
    currentTask,
    downloadStats,
    isDownloading,
    hasError,
    hasActiveTasks,
    
    // Actions
    startDownload,
    stopDownloadTask,
    loadAllTasks,
    refreshTaskStatus,
    startPolling,
    stopPolling,
    stopAllPolling,
    performBatchOperation,
    retryFailedChaptersForTask,
    updateDownloadConfig,
    resetDownloadConfig,
    getTaskProgress,
    removeTask,
    setLoading,
    setError,
    clearError,
    setCurrentTask,
    reset,
    cleanup
  };
});