// 通用类型定义
export interface ApiResponse<T = any> {
  status: string;
  data: T;
  message: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
}

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorState {
  hasError: boolean;
  error: ErrorInfo | null;
  retryCount: number;
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

// 状态类型
export type Status = 'idle' | 'loading' | 'success' | 'error';

// 操作结果类型
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
}