# 小说爬虫API接口文档

## 接口概述

本API基于FastAPI框架，提供小说搜索、目录获取、内容下载等功能。所有接口遵循RESTful规范，返回JSON格式数据。

## 基础信息

- **Base URL**: `http://127.0.0.1:8000`
- **数据格式**: JSON
- **编码**: UTF-8
- **版本**: v1

## 通用响应格式

所有接口返回统一格式的JSON数据：

```json
{
  "status": "success|error",
  "message": "操作结果的描述信息",
  "data": "具体业务数据",
  "code": 200  // HTTP状态码
}
```

## 接口详情

### 1. 健康检查
检查服务运行状态。

- **URL**: `/health`
- **Method**: `GET`
- **参数**: 无
- **响应示例**:
```json
{
  "status": "healthy",
  "message": "服务运行正常"
}
```

### 2. 小说搜索
根据关键字搜索小说。

- **URL**: `/api/search`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键字 |

- **请求示例**:
```json
{
  "keyword": "剑来"
}
```

- **响应数据格式**:
```json
[
  {
    "url_list": "/book/29799/",
    "url_img": "https://www.97c286.cfd/bookimg/0/29799.jpg",
    "articlename": "剑来",
    "author": "烽火戏诸侯",
    "intro": "大千世界，无奇不有。我陈平安，唯有一剑，可搬山，断江，倒海，降妖，镇魔，敕神，摘星，摧城，开天！"
  }
]
```

- **完整响应示例**:
```json
{
  "status": "success",
  "message": "搜索完成",
  "data": [
    {
      "url_list": "/book/29799/",
      "url_img": "https://www.97c286.cfd/bookimg/0/29799.jpg",
      "articlename": "剑来",
      "author": "烽火戏诸侯",
      "intro": "大千世界，无奇不有。我陈平安，唯有一剑，可搬山，断江，倒海，降妖，镇魔，敕神，摘星，摧城，开天！"
    }
  ]
}
```

### 3. 获取小说目录
获取指定小说的目录信息。

- **URL**: `/api/catalog`
- **Method**: `POST`
- **Content-Type**: `application/json` 或 `application/x-www-form-urlencoded`
- **支持方式**: JSON请求体 或 Query参数
- **请求参数**:

| 参数名      | 类型  | 必填 | 说明          |
|----------|-----|------|-------------|
| novel_id | int | 是 | 小说在搜索列表中的索引（从0开始） |

- **请求示例**:

**方式1：JSON请求体**
```json
{
  "novel_id": 0
}
```

**方式2：Query参数**
```bash
POST /api/catalog?novel_id=0
```

- **响应数据格式**:
```json
{
  "novel_info": {
    "novel_id": "/book/29799/",
    "novel_title": "剑来",
    "author": "烽火戏诸侯",
    "total_chapters": 1200,
    "domain": "www.97c286.cfd",
    "detail_url": "https://www.97c286.cfd/book/29799/"
  },
  "chapters": [
    {
      "title": "第1章 少年",
      "url": "/book/29799/1.html"
    },
    {
      "title": "第2章 草鞋少年",
      "url": "/book/29799/2.html"
    }
  ]
}
```

- **完整响应示例**:
```json
{
  "status": "success",
  "message": "目录获取完成",
  "data": {
    "novel_info": {
      "novel_id": "/book/29799/",
      "novel_title": "剑来",
      "author": "烽火戏诸侯",
      "total_chapters": 1200,
      "domain": "www.97c286.cfd",
      "detail_url": "https://www.97c286.cfd/book/29799/"
    },
    "chapters": [
      {
        "title": "第1章 少年",
        "url": "/book/29799/1.html"
      },
      {
        "title": "第2章 草鞋少年",
        "url": "/book/29799/2.html"
      }
    ]
  }
}
```

### 4. 开始下载小说
开始下载指定小说的章节内容。

- **URL**: `/api/download/start`
- **Method**: `POST`
- **Content-Type**: `application/json` 或 `application/x-www-form-urlencoded`
- **支持方式**: JSON请求体 或 Query参数
- **请求参数**:

| 参数名           | 类型     | 必填 | 默认值  | 说明                     |
|---------------|--------|----|------|------------------------|
| novel_url     | string | 是  | -    | 小说URL路径，如"/book/29799/" |
| book_name     | string | 是  | temp | 书籍名称                   |
| start_chapter | int    | 否  | 1    | 开始章节索引（从1开始）           |
| end_chapter   | int    | 否  | -1   | 结束章节索引，-1表示下载到最后章节     |
| mode          | enum   | 否  | txt  | 下载模式，可选txt、epub |

- **请求示例**:

**方式1：JSON请求体**
```json
{
  "novel_url": "/book/29799/",
  "book_name": "剑来",
  "start_chapter": 1,
  "end_chapter": 100,
  "mode": "txt"
}
```

**方式2：Query参数**
```bash
POST /api/download/start?novel_url=/book/29799/&book_name=剑来&start_chapter=1&end_chapter=100&mode=txt
```

- **响应示例**:
```json
{
  "status": "success",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "下载任务已启动",
  "details": {
    "novel_url": "/book/29799/",
    "book_name": "剑来",
    "start_chapter": 1,
    "end_chapter": 100,
    "mode": "txt",
    "path": "output/剑来.txt"
  }
}
```

### 5. 获取下载状态
获取指定任务的下载进度和状态信息。

- **URL**: `/api/download/status/{task_id}`
- **Method**: `GET`
- **URL参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| task_id | string | 是 | 任务ID |

- **响应示例**:
```json
{
  "status": "success",
  "task": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "running",
    "progress": 45,
    "total_chapters": 100,
    "downloaded_chapters": 45,
    "start_time": "2024-12-19 15:30:45",
    "current_time": "2024-12-19 15:35:30",
    "message": "正在下载第45章...",
    "novel_url": "/book/29799/",
    "book_name": "剑来",
    "mode": "txt"
  }
}

- **状态说明**:
  - `running`: 任务进行中
  - `completed`: 任务已完成
  - `failed`: 任务失败
  - `stopped`: 任务已停止
```

### 6. 停止下载任务
停止指定的下载任务。

- **URL**: `/api/download/stop/{task_id}`
- **Method**: `POST`
- **请求参数**:

| 参数名    | 类型   | 必填 | 说明   |
|---------|------|------|------|
| task_id | string | 是 | 任务ID |

- **响应示例**:
```json
{
  "status": "success",
  "message": "下载任务已停止"
}
```

### 7. 获取所有任务列表
获取当前所有下载任务的状态信息。

- **URL**: `/api/download/tasks`
- **Method**: `GET`
- **响应示例**:
```json
{
  "status": "success",
  "tasks": [
    {
      "task_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "progress": 100,
      "total_chapters": 50,
      "downloaded_chapters": 50,
      "start_time": "2024-12-19 15:30:45",
      "current_time": "2024-12-19 15:35:30",
      "message": "下载完成",
      "novel_url": "/book/29799/",
      "book_name": "剑来",
      "mode": "txt"
    },
    {
      "task_id": "660e8400-e29b-41d4-a716-446655440001",
      "status": "running",
      "progress": 25,
      "total_chapters": 80,
      "downloaded_chapters": 20,
      "start_time": "2024-12-19 15:45:00",
      "current_time": "2024-12-19 15:47:30",
      "message": "正在下载第20章...",
      "novel_url": "/book/12345/",
      "book_name": "斗破苍穹",
      "mode": "epub"
    }
  ]
}
```

## 错误处理

### 错误响应格式
所有接口在发生错误时都会返回统一的错误格式：

```json
{
  "status": "error",
  "message": "错误描述信息",
  "code": "ERROR_CODE"
}
```

### 常见错误码

| 错误码 | 说明 |
|--------|------|
| INVALID_PARAMETER | 参数不合法 |
| NOVEL_NOT_FOUND | 小说不存在 |
| TASK_NOT_FOUND | 任务不存在 |
| DOWNLOAD_FAILED | 下载失败 |
| SYSTEM_ERROR | 系统内部错误 |

## 使用示例

### Python示例

```python
import requests

# 搜索小说
response = requests.post(
    "http://127.0.0.1:8000/api/search",
    json={"keyword": "剑来"}
)
print(response.json())

# 获取目录
response = requests.post(
    "http://127.0.0.1:8000/api/catalog",
    json={"novel_url": "/book/29799/"}
)
print(response.json())

# 开始下载
response = requests.post(
    "http://127.0.0.1:8000/api/download/start",
    json={
        "novel_url": "/book/29799/",
        "start_chapter": 1,
        "end_chapter": 100
    }
)
task_id = response.json()["task_id"]

# 查询下载状态
response = requests.get(f"http://127.0.0.1:8000/api/download/status/{task_id}")
print(response.json())
```

### curl示例

```bash
# 搜索小说
curl -X POST "http://127.0.0.1:8000/api/search" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "剑来"}'

# 获取目录
curl -X POST "http://127.0.0.1:8000/api/catalog" \
  -H "Content-Type: application/json" \
  -d '{"novel_url": "/book/29799/"}'

# 开始下载
curl -X POST "http://127.0.0.1:8000/api/download/start" \
  -H "Content-Type: application/json" \
  -d '{"novel_url": "/book/29799/", "start_chapter": 1, "end_chapter": 100}'
```

## 注意事项

1. 所有POST请求必须设置正确的`Content-Type: application/json`头
2. 参数必须符合JSON格式，字符串必须使用双引号
3. 下载任务ID在启动下载时返回，用于后续状态查询
4. 下载的小说文件将保存在`output/`目录下，文件名为小说标题.txt
5. 搜索和目录结果会缓存到本地JSON文件中，提高响应速度