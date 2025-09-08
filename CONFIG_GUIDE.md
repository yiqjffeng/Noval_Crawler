# 配置指南

本文档说明如何通过修改 `book_crawler/config.py` 来自定义爬虫的行为。

## 📁 输出文件配置

### 搜索结果输出
```python
OUTPUT_DIRECTORY = "output"                                    # 输出目录
OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, "search_result.json")  # 搜索结果文件
```

### 目录结果输出
```python
CATALOG_OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, "catalog_result.json")  # 目录结果文件
```

**自定义示例**：
```python
# 修改输出目录
OUTPUT_DIRECTORY = "data"

# 修改文件名
OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, "novels_search.json")
CATALOG_OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, "novel_chapters.json")
```

## 🔍 CSS选择器配置

```python
CSS_SELECTORS = {
    'title': 'h1::text',                    # 小说标题选择器
    'title_fallback': '.info h1::text',     # 标题备用选择器
    'author_spans': '.small span::text',    # 作者信息选择器
    'chapter_links': '.listmain dl dd a',   # 章节链接选择器
    'chapter_title': '::text',              # 章节标题选择器
    'chapter_url': '::attr(href)'           # 章节URL选择器
}
```

**自定义示例**：
```python
# 如果网站结构发生变化，可以修改选择器
CSS_SELECTORS = {
    'title': '.book-title::text',           # 新的标题选择器
    'title_fallback': '.novel-name::text',  # 新的备用选择器
    'author_spans': '.author-info span::text',
    'chapter_links': '.chapter-list a',
    'chapter_title': '::text',
    'chapter_url': '::attr(href)'
}
```

## 🚫 章节过滤配置

### 无效章节关键词（完全匹配）
```python
INVALID_CHAPTER_KEYWORDS = [
    '展开全部章节', '展开', '收起', '---', '<<<', '>>>', 
    '返回目录', '上一页', '下一页', '首页', '尾页'
]
```

### 无效章节前缀（开头匹配）
```python
INVALID_CHAPTER_PREFIXES = ['展开', '收起', '<<<', '>>>']
```

### 导航关键词（完全匹配）
```python
NAVIGATION_KEYWORDS = ['请假条', '单章感言', '作者有话说']
```

**自定义示例**：
```python
# 添加更多过滤规则
INVALID_CHAPTER_KEYWORDS = [
    '展开全部章节', '展开', '收起', '---', '<<<', '>>>', 
    '返回目录', '上一页', '下一页', '首页', '尾页',
    '广告', '推荐', '公告'  # 新增过滤词
]

# 添加更多导航关键词
NAVIGATION_KEYWORDS = [
    '请假条', '单章感言', '作者有话说',
    '上架感言', '完本感言', '新书预告'  # 新增导航词
]
```

## 🌐 域名和重试配置

### 支持的域名
```python
SUPPORTED_DOMAINS = [
    "www.bqgl.cc",
    "www.bqg128.com",
]
DEFAULT_DOMAIN = "www.bqgl.cc"
```

### 重试配置
```python
MAX_RETRY_TIMES = 3           # 每个域名最多重试次数
MAX_TOTAL_ATTEMPTS = len(SUPPORTED_DOMAINS) * MAX_RETRY_TIMES
RETRY_DELAY = 3               # 重试延迟（秒）
```

**自定义示例**：
```python
# 添加更多备用域名
SUPPORTED_DOMAINS = [
    "www.bqgl.cc",
    "www.bqg128.com",
    "www.bqg789.com",    # 新增域名
    "www.novel123.com"   # 新增域名
]

# 调整重试策略
MAX_RETRY_TIMES = 5     # 增加重试次数
RETRY_DELAY = 5         # 增加重试延迟
```

## 📋 请求头配置

```python
REQUEST_HEADERS = {
    "accept": "application/json",
    "accept-encoding": "gzip, deflate",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "x-requested-with": "XMLHttpRequest"
}
```

**自定义示例**：
```python
# 修改User-Agent
REQUEST_HEADERS = {
    "accept": "application/json",
    "accept-encoding": "gzip, deflate",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "x-requested-with": "XMLHttpRequest"
}
```

## 🔧 配置修改步骤

1. **备份原配置**：
   ```bash
   cp book_crawler/config.py book_crawler/config.py.backup
   ```

2. **修改配置文件**：
   编辑 `book_crawler/config.py`，根据需要修改相应配置项

3. **测试配置**：
   ```bash
   cd book_crawler
   scrapy crawl catalog -a novel_url=/look/9412/
   ```

4. **验证输出**：
   检查输出文件是否按预期生成

## ⚠️ 注意事项

1. **文件路径**：修改输出目录时，确保路径存在或程序有创建权限
2. **CSS选择器**：修改选择器前，先检查目标网站的HTML结构
3. **域名配置**：添加新域名前，确保域名可访问且结构兼容
4. **过滤规则**：过滤规则过于严格可能会误删正常章节，过于宽松可能包含无效内容

## 🚀 高级配置示例

### 多环境配置
```python
import os

# 根据环境变量选择配置
ENV = os.getenv('CRAWLER_ENV', 'development')

if ENV == 'production':
    OUTPUT_DIRECTORY = "/data/novels"
    MAX_RETRY_TIMES = 5
elif ENV == 'testing':
    OUTPUT_DIRECTORY = "test_output"
    MAX_RETRY_TIMES = 1
else:  # development
    OUTPUT_DIRECTORY = "output"
    MAX_RETRY_TIMES = 3
```

### 动态文件名
```python
from datetime import datetime

# 带时间戳的输出文件
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
CATALOG_OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, f"catalog_{timestamp}.json")
```

通过这些配置，你可以灵活地调整爬虫行为，适应不同的需求和环境。