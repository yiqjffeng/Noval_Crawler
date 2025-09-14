import axios, { 
  type AxiosInstance, 
  type AxiosRequestConfig, 
  type AxiosResponse,
  type AxiosError
} from 'axios';
import type { 
  ApiConfig, 
  RequestConfig, 
  ApiError, 
  RetryConfig,
  RequestInterceptorConfig,
  ResponseInterceptorConfig
} from '@/types/api';
import type { ApiResponse } from '@/types/common';

// 默认配置
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: false,
};

// 默认重试配置
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: ApiError) => {
    return !error.response || (error.response.status >= 500);
  },
};

class HttpClient {
  private instance: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    this.retryConfig = DEFAULT_RETRY_CONFIG;
    
    this.instance = axios.create({
      baseURL: finalConfig.baseURL,
      timeout: finalConfig.timeout,
      headers: finalConfig.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加请求时间戳
        (config as any).metadata = { startTime: Date.now() };
        
        // 添加请求ID
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
        
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(this.transformError(error));
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        const duration = Date.now() - ((response.config as any).metadata?.startTime || 0);
        
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          duration: `${duration}ms`,
          data: response.data,
        });
        
        return response;
      },
      async (error) => {
        console.error('[API Response Error]', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        
        // 重试逻辑
        if (this.shouldRetry(error)) {
          return this.retryRequest(error);
        }
        
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldRetry(error: AxiosError): boolean {
    const config = error.config as any;
    
    if (!config || config.__retryCount >= this.retryConfig.retries) {
      return false;
    }
    
    return this.retryConfig.retryCondition ? 
      this.retryConfig.retryCondition(error as ApiError) : 
      true;
  }

  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as any;
    config.__retryCount = config.__retryCount || 0;
    config.__retryCount += 1;

    console.log(`[API Retry] Attempt ${config.__retryCount}/${this.retryConfig.retries} for ${config.url}`);

    // 等待重试延迟
    await new Promise(resolve => 
      setTimeout(resolve, this.retryConfig.retryDelay * config.__retryCount)
    );

    return this.instance.request(config);
  }

  private transformError(error: any): ApiError {
    const apiError: ApiError = new Error(error.message) as ApiError;
    
    if (error.response) {
      // 服务器响应错误
      apiError.code = `HTTP_${error.response.status}`;
      apiError.status = error.response.status;
      apiError.response = error.response.data;
      apiError.message = error.response.data?.message || error.message;
    } else if (error.request) {
      // 网络错误
      apiError.code = 'NETWORK_ERROR';
      apiError.message = '网络连接失败，请检查后端服务是否启动';
    } else {
      // 其他错误
      apiError.code = 'UNKNOWN_ERROR';
      apiError.message = error.message || '未知错误';
    }
    
    apiError.config = error.config;
    return apiError;
  }

  // 通用请求方法
  async request<T = any>(config: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.request({
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data,
        headers: config.headers,
        timeout: config.timeout,
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // GET 请求
  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>({
      url,
      method: 'GET',
      params,
    });
  }

  // POST 请求
  async post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config,
    });
  }

  // PUT 请求
  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
    });
  }

  // DELETE 请求
  async delete<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>({
      url,
      method: 'DELETE',
      params,
    });
  }

  // 设置请求拦截器
  setRequestInterceptor(config: RequestInterceptorConfig) {
    if (config.onRequest) {
      this.instance.interceptors.request.use(config.onRequest, config.onRequestError);
    }
  }

  // 设置响应拦截器
  setResponseInterceptor(config: ResponseInterceptorConfig) {
    if (config.onResponse) {
      this.instance.interceptors.response.use(config.onResponse, config.onResponseError);
    }
  }

  // 设置重试配置
  setRetryConfig(config: Partial<RetryConfig>) {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  // 获取实例
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 创建默认实例
export const httpClient = new HttpClient();

// 导出类和实例
export { HttpClient };
export default httpClient;