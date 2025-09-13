---
title: 默认模块
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 默认模块

Base URLs:

# Authentication

# Default

## POST 搜索接口

POST /api/search

> Body 请求参数

```json
{}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|keyword|query|string| 是 |搜索关键词|
|body|body|object| 否 |none|

> 返回示例

> 200 Response

```json
{
  "status": "string",
  "data": [
    {
      "url_list": "string",
      "url_img": "string",
      "articlename": "string",
      "author": "string",
      "intro": "string"
    }
  ],
  "message": "string",
  "keyword": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» status|string|true|none||none|
|» data|[object]|true|none||none|
|»» url_list|string|true|none||none|
|»» url_img|string|true|none||none|
|»» articlename|string|true|none||none|
|»» author|string|true|none||none|
|»» intro|string|true|none||none|
|» message|string|true|none||none|
|» keyword|string|true|none||none|

## POST 目录信息接口

POST /api/catalog

> Body 请求参数

```json
{}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|novel_id|query|integer| 否 |none|
|body|body|object| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 下载请求开始接口

POST /api/download/start

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|novel_url|query|string| 是 |小说URL路径，如"/book/29799/"|
|start_chapter|query|string| 否 |开始章节索引（从1开始） |
|end_chapter|query|string| 否 |结束章节索引，-1表示下载到最后章节|
|path|query|string| 否 |下载文件保存路径 |
|book_name|query|string| 是 |书籍名称 |
|mode|query|string| 是 |下载模式，可选txt、epub|

> 返回示例

> 200 Response

```json
{
  "status": "string",
  "task_id": "string",
  "message": "string",
  "details": {
    "novel_url": "string",
    "book_name": "string",
    "start_chapter": 0,
    "end_chapter": 0,
    "mode": "string",
    "path": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» status|string|true|none||none|
|» task_id|string|true|none||none|
|» message|string|true|none||none|
|» details|object|true|none||none|
|»» novel_url|string|true|none||none|
|»» book_name|string|true|none||none|
|»» start_chapter|integer|true|none||none|
|»» end_chapter|integer|true|none||none|
|»» mode|string|true|none||none|
|»» path|string|true|none||none|

## GET 下载进度显示接口

GET /api/download/status/{task_id}

> Body 请求参数

```json
{}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|task_id|path|string| 是 |下载任务的uuid|
|body|body|object| 否 |none|

> 返回示例

> 200 Response

```json
{
  "status": "string",
  "data": {
    "task_id": "string",
    "status": "string",
    "novel_url": "string",
    "start_chapter": 0,
    "end_chapter": 0,
    "current": 0,
    "total": 0,
    "percentage": 0,
    "failed_chapters": [
      null
    ]
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» status|string|true|none||none|
|» data|object|true|none||none|
|»» task_id|string|true|none||none|
|»» status|string|true|none||none|
|»» novel_url|string|true|none||none|
|»» start_chapter|integer|true|none||none|
|»» end_chapter|integer|true|none||none|
|»» current|integer|true|none||none|
|»» total|integer|true|none||none|
|»» percentage|integer|true|none||none|
|»» failed_chapters|[any]|true|none||none|

## GET 下载任务查询接口

GET /api/download/tasks

> 返回示例

> 200 Response

```json
{
  "status": "string",
  "data": [
    {
      "task_id": "string",
      "status": "string",
      "novel_url": "string",
      "start_chapter": 0,
      "end_chapter": 0,
      "start_time": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» status|string|true|none||none|
|» data|[object]|true|none||none|
|»» task_id|string|false|none||none|
|»» status|string|false|none||none|
|»» novel_url|string|false|none||none|
|»» start_chapter|integer|false|none||none|
|»» end_chapter|integer|false|none||none|
|»» start_time|string|false|none||none|

# 数据模型

