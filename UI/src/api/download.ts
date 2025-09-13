import httpClient from '@/utils/request';
import type { 
  DownloadRequest,
  StartDownloadResponse,
  DownloadStatusResponse,
  DownloadTasksResponse,
  BatchOperationRequest
} from '@/types/download';
import type { ApiResponse } from '@/types/common';

/**
 * 开始下载任务
 * @param params 下载参数
 * @returns 下载任务ID
 */
export const startDownload = async (params: DownloadRequest): Promise<StartDownloadResponse> => {
  try {
    const requestData = {
      novel_url: params.novel_url,
      book_name: params.book_name,
      start_chapter: params.start_chapter,
      end_chapter: params.end_chapter,
      mode: params.mode
    };
    
    const response = await httpClient.post<StartDownloadResponse>('/api/download/start', requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 下载请求超时时间较长
    });
    
    if (!response.task_id) {
      throw new Error('下载任务创建失败：未返回任务ID');
    }
    
    return response;
  } catch (error: any) {
    console.error('[API] 开始下载失败:', error);
    
    // 处理CORS错误
    if (error.code === 'NETWORK_ERROR') {
      throw {
        status: 'error',
        message: '网络连接失败，请检查后端服务是否启动',
        data: null,
        task_id: '',
      } as StartDownloadResponse;
    }
    
    throw {
      status: 'error',
      message: error.message || '下载任务创建失败，请重试',
      data: null,
      task_id: '',
    } as StartDownloadResponse;
  }
};

/**
 * 获取下载任务状态
 * @param taskId 任务ID
 * @returns 下载状态
 */
export const getDownloadStatus = async (taskId: string): Promise<DownloadStatusResponse> => {
  try {
    const response = await httpClient.get<DownloadStatusResponse>(`/api/download/status/${taskId}`);
    
    if (!response.data) {
      throw new Error('获取下载状态失败：响应数据为空');
    }
    
    // 确保状态数据完整性
    response.data = {
      task_id: response.data.task_id || taskId,
      status: response.data.status || 'pending',
      book_name: response.data.book_name || '未知书名',
      novel_url: response.data.novel_url || '',
      start_chapter: response.data.start_chapter || 1,
      end_chapter: response.data.end_chapter || 1,
      current: response.data.current || 0,
      total: response.data.total || 0,
      percentage: response.data.percentage || 0,
      failed_chapters: response.data.failed_chapters || [],
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
      error_message: response.data.error_message,
      download_speed: response.data.download_speed,
      estimated_time: response.data.estimated_time,
    };
    
    return response;
  } catch (error: any) {
    console.error('[API] 获取下载状态失败:', error);
    
    throw {
      status: 'error',
      message: error.message || '获取下载状态失败',
      data: {
        task_id: taskId,
        status: 'failed',
        book_name: '',
        novel_url: '',
        start_chapter: 0,
        end_chapter: 0,
        current: 0,
        total: 0,
        percentage: 0,
        failed_chapters: [],
      },
    } as DownloadStatusResponse;
  }
};

/**
 * 停止下载任务
 * @param taskId 任务ID
 * @returns 操作结果
 */
export const stopDownload = async (taskId: string): Promise<ApiResponse> => {
  try {
    const response = await httpClient.post<ApiResponse>(`/api/download/stop/${taskId}`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error: any) {
    console.error('[API] 停止下载失败:', error);
    
    throw {
      status: 'error',
      message: error.message || '停止下载失败',
      data: null,
    } as ApiResponse;
  }
};

/**
 * 获取所有下载任务
 * @returns 下载任务列表
 */
export const getDownloadTasks = async (): Promise<DownloadTasksResponse> => {
  try {
    const response = await httpClient.get<DownloadTasksResponse>('/api/download/tasks');
    
    if (!response.data || !Array.isArray(response.data)) {
      response.data = [];
    }
    
    // 确保每个任务数据的完整性
    response.data = response.data.map(task => ({
      task_id: task.task_id || '',
      status: task.status || 'pending',
      book_name: task.book_name || '未知书名',
      novel_url: task.novel_url || '',
      start_chapter: task.start_chapter || 1,
      end_chapter: task.end_chapter || 1,
      current: task.current || 0,
      total: task.total || 0,
      percentage: task.percentage || 0,
      failed_chapters: task.failed_chapters || [],
      created_at: task.created_at,
      updated_at: task.updated_at,
      error_message: task.error_message,
      download_speed: task.download_speed,
      estimated_time: task.estimated_time,
    }));
    
    return response;
  } catch (error: any) {
    console.error('[API] 获取下载任务列表失败:', error);
    
    throw {
      status: 'error',
      message: error.message || '获取下载任务列表失败',
      data: [],
    } as DownloadTasksResponse;
  }
};

/**
 * 批量操作下载任务
 * @param params 批量操作参数
 * @returns 操作结果
 */
export const batchOperation = async (params: BatchOperationRequest): Promise<ApiResponse> => {
  try {
    const response = await httpClient.post<ApiResponse>('/api/download/batch', params, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error: any) {
    console.error('[API] 批量操作失败:', error);
    
    throw {
      status: 'error',
      message: error.message || '批量操作失败',
      data: null,
    } as ApiResponse;
  }
};

/**
 * 重试失败的章节
 * @param taskId 任务ID
 * @param chapterNumbers 章节号列表
 * @returns 操作结果
 */
export const retryFailedChapters = async (
  taskId: string, 
  chapterNumbers: number[]
): Promise<ApiResponse> => {
  try {
    const response = await httpClient.post<ApiResponse>(`/api/download/retry/${taskId}`, {
      chapters: chapterNumbers,
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error: any) {
    console.error('[API] 重试失败章节失败:', error);
    
    throw {
      status: 'error',
      message: error.message || '重试失败章节失败',
      data: null,
    } as ApiResponse;
  }
};