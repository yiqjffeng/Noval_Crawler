import httpClient from '@/utils/request';
import type { BookCrawlerAPI } from '@/types/api';
import type { ApiResponse } from '@/types/common';

// API 基础URL配置
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// 导出所有API模块
export * from './search';
export * from './catalog';
export * from './download';

// 健康检查接口
export const healthCheck = async (): Promise<ApiResponse> => {
  return httpClient.get('/health');
};

// 创建统一的API实例
export const createAPI = (): BookCrawlerAPI => {
  return {
    // 搜索接口 - 延迟导入避免循环依赖
    search: async (params) => {
      const { searchBooks } = await import('./search');
      return searchBooks(params);
    },
    
    // 目录接口
    getCatalog: async (params) => {
      const { getCatalog } = await import('./catalog');
      return getCatalog(params);
    },
    
    // 下载接口
    startDownload: async (params) => {
      const { startDownload } = await import('./download');
      return startDownload(params);
    },
    
    getDownloadStatus: async (taskId) => {
      const { getDownloadStatus } = await import('./download');
      return getDownloadStatus(taskId);
    },
    
    stopDownload: async (taskId) => {
      const { stopDownload } = await import('./download');
      return stopDownload(taskId);
    },
    
    getDownloadTasks: async () => {
      const { getDownloadTasks } = await import('./download');
      return getDownloadTasks();
    },
    
    batchOperation: async (params) => {
      const { batchOperation } = await import('./download');
      return batchOperation(params);
    },
    
    healthCheck,
  };
};

// 默认API实例
export const api = createAPI();

// 导出默认实例
export default api;