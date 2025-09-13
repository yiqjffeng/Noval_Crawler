import type { 
  SearchRequest, 
  SearchResponse, 
  CatalogRequest, 
  CatalogResponse 
} from './book';
import type { 
  DownloadRequest, 
  StartDownloadResponse, 
  DownloadStatusResponse, 
  DownloadTasksResponse,
  BatchOperationRequest
} from './download';
import type { ApiResponse } from './common';

// API 基础配置
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

// 请求拦截器配置
export interface RequestInterceptorConfig {
  onRequest?: (config: any) => any;
  onRequestError?: (error: any) => Promise<any>;
}

// 响应拦截器配置
export interface ResponseInterceptorConfig {
  onResponse?: (response: any) => any;
  onResponseError?: (error: any) => Promise<any>;
}

// API 接口定义
export interface BookCrawlerAPI {
  // 搜索接口
  search: (params: SearchRequest) => Promise<SearchResponse>;
  
  // 目录接口
  getCatalog: (params: CatalogRequest) => Promise<CatalogResponse>;
  
  // 下载接口
  startDownload: (params: DownloadRequest) => Promise<StartDownloadResponse>;
  getDownloadStatus: (taskId: string) => Promise<DownloadStatusResponse>;
  stopDownload: (taskId: string) => Promise<ApiResponse>;
  getDownloadTasks: () => Promise<DownloadTasksResponse>;
  
  // 批量操作
  batchOperation: (params: BatchOperationRequest) => Promise<ApiResponse>;
  
  // 健康检查
  healthCheck: () => Promise<ApiResponse>;
}

// HTTP 方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 请求配置
export interface RequestConfig {
  url: string;
  method: HttpMethod;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

// API 错误类型
export interface ApiError extends Error {
  code?: string;
  status?: number;
  response?: any;
  config?: RequestConfig;
}

// 重试配置
export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: ApiError) => boolean;
}