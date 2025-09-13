# 前端API配置修复设计文档

## 1. 问题概述

前端与后端API通信时出现CORS预检请求（OPTIONS）被拒绝的问题，错误信息显示：

```
INFO:     127.0.0.1:50477 - "OPTIONS /api/search HTTP/1.1" 405 Method Not Allowed
```

这是典型的跨域资源共享（CORS）配置问题，需要修复后端的CORS配置和优化前端的API请求方式。

## 2. 问题分析

### 2.1 CORS预检请求机制
- 浏览器在发送POST请求时，会先发送OPTIONS预检请求
- 后端FastAPI服务未配置CORS中间件，拒绝了OPTIONS请求
- 前端请求被阻止，无法正常调用API接口

### 2.2 当前配置问题
- FastAPI应用缺少CORS中间件配置
- 前端请求头Content-Type为application/json触发预检请求
- 后端不支持OPTIONS方法

## 3. 修复方案

### 3.1 后端CORS配置修复

#### 3.1.1 安装CORS依赖
FastAPI应用需要添加CORS中间件支持，在requirements中确保包含：
```
fastapi[all]>=0.104.0
```

#### 3.1.2 CORS中间件配置
在`fastapi_app/main.py`中添加CORS中间件：

```python
from fastapi import FastAPI, HTTPException, Query, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# ... 其他导入

app = FastAPI(title="小说爬虫API", description="基于Scrapy的小说爬虫FastAPI接口")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

#### 3.1.3 开发环境CORS配置
为了开发便利，可以配置更宽松的CORS策略：

```python
# 开发环境配置
import os
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

if DEBUG:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 开发环境允许所有源
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # 生产环境配置
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000", 
            "http://localhost:5173"
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
    )
```

### 3.2 前端API请求优化

#### 3.2.1 API基础配置优化
修改`UI/src/utils/request.ts`中的基础配置：

```typescript
// 默认配置
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // CORS请求不需要凭据
};
```

#### 3.2.2 请求拦截器优化
在请求拦截器中添加CORS相关配置：

```typescript
private setupInterceptors() {
  // 请求拦截器
  this.instance.interceptors.request.use(
    (config) => {
      // 添加请求时间戳
      config.metadata = { startTime: Date.now() };
      
      // 添加请求ID
      config.headers['X-Request-ID'] = this.generateRequestId();
      
      // 确保Content-Type正确设置
      if (config.method === 'post' && config.data) {
        config.headers['Content-Type'] = 'application/json';
      }
      
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        headers: config.headers
      });
      
      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(this.transformError(error));
    }
  );
}
```

#### 3.2.3 环境变量配置
创建`UI/.env.development`文件：

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_APP_DEBUG=true
```

创建`UI/.env.production`文件：

```env
VITE_API_URL=http://localhost:8000
VITE_APP_DEBUG=false
```

### 3.3 API调用方式优化

#### 3.3.1 搜索API调用优化
修改`UI/src/api/search.ts`：

```typescript
export const searchBooks = async (params: SearchRequest): Promise<SearchResponse> => {
  try {
    // 确保参数格式正确
    const requestData = {
      keyword: params.keyword.trim()
    };
    
    const response = await httpClient.post<SearchResponse>('/api/search', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 数据验证和处理
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('搜索结果格式错误');
    }
    
    return response;
  } catch (error: any) {
    console.error('[API] 搜索失败:', error);
    
    // 处理CORS错误
    if (error.code === 'NETWORK_ERROR') {
      throw {
        status: 'error',
        message: '网络连接失败，请检查后端服务是否启动',
        data: [],
        keyword: params.keyword,
      } as SearchResponse;
    }
    
    throw {
      status: 'error',
      message: error.message || '搜索失败，请重试',
      data: [],
      keyword: params.keyword,
    } as SearchResponse;
  }
};
```

#### 3.2.2 目录API调用优化
修改`UI/src/api/catalog.ts`：

```typescript
export const getCatalog = async (params: CatalogRequest): Promise<CatalogResponse> => {
  try {
    const requestData = {
      novel_id: params.novel_id
    };
    
    const response = await httpClient.post<CatalogResponse>('/api/catalog', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error: any) {
    console.error('[API] 获取目录失败:', error);
    throw error;
  }
};
```

#### 3.2.3 下载API调用优化
修改`UI/src/api/download.ts`：

```typescript
export const startDownload = async (params: DownloadRequest): Promise<DownloadResponse> => {
  try {
    const requestData = {
      novel_url: params.novel_url,
      book_name: params.book_name,
      start_chapter: params.start_chapter,
      end_chapter: params.end_chapter,
      mode: params.mode
    };
    
    const response = await httpClient.post<DownloadResponse>('/api/download/start', requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 下载请求超时时间较长
    });
    
    return response;
  } catch (error: any) {
    console.error('[API] 启动下载失败:', error);
    throw error;
  }
};
```

## 4. 测试验证

### 4.1 CORS配置验证
启动后端服务后，可以通过浏览器开发者工具验证CORS配置：
- 查看Network标签页中的OPTIONS请求是否返回200状态码
- 确认响应头包含正确的CORS配置信息

### 4.2 API调用验证
在浏览器开发者工具中验证：
- 搜索接口调用是否正常
- 目录接口调用是否正常  
- 下载接口调用是否正常

### 4.3 错误处理验证
测试各种错误场景：
- 后端服务未启动时的错误处理
- 网络异常时的错误处理
- 参数错误时的错误处理

## 5. 最佳实践建议

### 5.1 开发环境配置
- 开发时使用宽松的CORS配置便于调试
- 生产环境使用严格的CORS配置保证安全

### 5.2 错误监控
- 添加详细的错误日志记录
- 区分不同类型的错误（网络错误、服务器错误、业务错误）

### 5.3 性能优化
- 合理设置请求超时时间
- 实现请求重试机制
- 添加请求缓存机制

### 5.4 安全考虑
- 生产环境限制允许的源域名
- 避免在响应头中暴露敏感信息
- 实现适当的身份验证机制

## 6. 部署注意事项

### 6.1 环境变量配置
确保在不同环境中正确配置API基础URL：
- 开发环境：http://127.0.0.1:8000
- 测试环境：根据实际服务器地址配置
- 生产环境：根据实际域名配置

### 6.2 服务器配置
如果通过反向代理部署，需要确保代理服务器正确转发CORS头信息。

### 6.3 监控告警
建立API调用成功率监控，及时发现和解决CORS相关问题。