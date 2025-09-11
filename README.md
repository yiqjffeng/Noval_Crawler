# 📚 小说爬虫项目 (Book Crawler)

一个基于Scrapy的分布式小说爬虫系统，支持多域名自动切换、智能反爬策略和完整的内容爬取流程。

## 🌟 功能特性

### 核心功能
- **智能搜索**: 支持关键词搜索小说，多域名自动切换
- **目录获取**: 自动解析小说目录结构，提取章节信息
- **内容爬取**: 批量爬取章节内容，支持内容清洗和格式化
- **反爬策略**: 动态User-Agent、请求间隔随机化、域名轮询
- **失败重试**: 智能重试机制，支持域名切换
- **用户交互**: 友好的命令行界面，可视化选择小说

### 技术亮点
- **分布式架构**: 支持5个备用域名轮询
- **并发控制**: 可配置的并发请求和写入
- **数据持久化**: JSON格式存储搜索结果，TXT格式保存小说内容
- **内容清洗**: 自动过滤广告、导航元素等无效内容
- **UTF-8编码**: 完整支持中文内容，无乱码问题

## 🛠️ 技术栈

### 核心框架
- **Scrapy 2.11+**: 强大的爬虫框架
- **Python 3.13+**: 现代Python版本
- **lxml 4.9+**: 高效的XML/HTML解析
- **requests 2.31+**: HTTP请求库
- **FastAPI 0.104+**: 现代Web框架，支持自动API文档

### 开发工具
- **uv**: 现代化的Python包管理器
- **清华大学镜像源**: 加速依赖下载
- **Git**: 版本控制

## 📁 项目目录结构

```
Book_Crawler/
├── book_crawler/           # 主爬虫包
│   ├── __init__.py        # 包初始化
│   ├── config.py          # 全局配置（域名、选择器、并发设置）
│   ├── items.py           # 数据结构定义
│   ├── pipelines.py       # 数据处理和存储管道
│   ├── settings.py        # Scrapy设置配置
│   ├── tools.py           # 工具函数（cookie生成等）
│   └── spiders/           # 爬虫实现
│       ├── __init__.py
│       ├── search_spider.py    # 搜索小说爬虫
│       ├── catalog_spider.py   # 目录获取爬虫
│       └── content_spider.py   # 内容爬取爬虫
├── run_demo.py            # 演示运行脚本
├── user_interface.py      # 用户交互界面
├── pyproject.toml         # 项目依赖配置
├── uv.lock               # 依赖版本锁定
├── scrapy.cfg            # Scrapy配置文件
├── README.md             # 项目文档
└── .gitignore            # Git忽略文件
```

## 🚀 快速开始

### 环境要求
- Python 3.13 或更高版本
- Windows/Linux/macOS 操作系统

### 安装步骤

1. **克隆项目**
```bash
git clone [项目地址]
cd Book_Crawler
```

2. **安装依赖**
```bash
# 使用uv安装（推荐）
uv sync

# 或使用pip
pip install -r requirements.txt
```

3. **运行演示**
```bash
# 运行完整演示
python run_demo.py

# 或分步骤运行
python user_interface.py
```

## 📖 使用方法

### 方式一：FastAPI Web接口（推荐）

#### 1. 启动FastAPI服务
```bash
cd fastapi_app
python main.py
```

#### 2. 使用Web接口
服务启动后，可以通过以下方式使用：

- **Swagger文档**: http://127.0.0.1:8000/docs
- **ReDoc文档**: http://127.0.0.1:8000/redoc

#### 3. 接口使用流程

**步骤1：搜索小说**
```bash
curl -X POST "http://127.0.0.1:8000/api/search" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "剑来"}'
```

**步骤2：获取目录**
```bash
curl -X POST "http://127.0.0.1:8000/api/catalog" \
  -H "Content-Type: application/json" \
  -d '{"novel_id": 0}'
```

**步骤3：开始下载**
```bash
curl -X POST "http://127.0.0.1:8000/api/download/start" \
  -H "Content-Type: application/json" \
  -d '{
  "novel_url": "/book/29799/",
  "book_name": "剑来",
  "start_chapter": 1,
  "end_chapter": 100,
  "mode": "txt"
}'
```

**步骤4：查看状态**
```bash
curl -X GET "http://127.0.0.1:8000/api/download/status/{task_id}"
```

### 方式二：命令行分步操作

#### 1. 搜索小说
```bash
# 搜索指定关键词
scrapy crawl search -a keyword="剑来"

# 搜索其他小说
scrapy crawl search -a keyword="斗破苍穹"
```

#### 2. 选择小说
运行交互界面选择要爬取的小说：
```bash
python user_interface.py
```

#### 3. 爬取目录
```bash
# 使用交互界面自动完成，或手动指定URL
scrapy crawl catalog -a novel_url="/book/12345"
```

#### 4. 爬取内容
```bash
# 基于目录文件爬取所有章节内容
scrapy crawl content
```

### 方式三：一键演示
```bash
# 运行完整演示流程
python run_demo.py
```

## ⚙️ 配置说明

### 支持的域名
项目配置了5个备用域名，自动轮询：
- `97c286.cfd` (默认)
- `efebde4.cfd`
- `7535b44.cfd`
- `0ae247c57c.icu`
- `4a109.cfd`

### 反爬配置 (config.py)
```python
# 并发控制
REQUEST_CONCURRENCY = 3      # 请求并发数
CONCURRENT_REQUESTS_PER_DOMAIN = 3  # 每个域名并发数
DOWNLOAD_DELAY = 2           # 请求间隔（秒）
RANDOMIZE_DOWNLOAD_DELAY = 1  # 随机延迟范围

# 重试配置
MAX_RETRY_TIMES = 3          # 每个域名重试次数
MAX_TOTAL_ATTEMPTS = 15      # 总尝试次数
```

### 输出文件
- **搜索结果**: `output/search_result.json`
- **目录信息**: `output/catalog_result.json`
- **小说内容**: `output/{关键词}.txt`

## 🔧 自定义配置

### 修改搜索域名
编辑 `book_crawler/config.py` 中的 `SUPPORTED_DOMAINS` 列表：
```python
SUPPORTED_DOMAINS = [
    "your-domain.com",
    "backup-domain.com",
    # ... 更多域名
]
```

### 调整CSS选择器
根据目标网站结构调整选择器：
```python
CSS_SELECTORS = {
    'title': 'h1::text',
    'chapter_links': '.listmain dl dd a',
    # ... 其他选择器
}
```

### 内容过滤规则
自定义无效内容过滤：
```python
INVALID_CHAPTER_KEYWORDS = [
    '广告', '推广', '本章完',  # 自定义过滤词
]
```

## 📊 数据格式

### 搜索结果格式
```json
[
  {
    "articlename": "小说标题",
    "author": "作者名称",
    "intro": "简介内容",
    "url_list": "/book/12345"
  }
]
```

### 目录数据格式
```json
{
  "novel_info": {
    "novel_title": "小说标题",
    "author": "作者",
    "total_chapters": 1000,
    "domain": "example.com"
  },
  "chapters": [
    {
      "title": "第一章",
      "url": "/book/12345/1.html"
    }
  ]
}
```

## 🛡️ 反爬策略

### 已实现的策略
1. **User-Agent轮换**: 每次请求使用不同的浏览器标识
2. **请求间隔**: 可配置的随机延迟
3. **域名轮询**: 失败时自动切换备用域名
4. **Cookie模拟**: 生成真实的浏览器cookie
5. **并发控制**: 限制请求频率避免被封
6. **Referer设置**: 模拟真实浏览行为

### 最佳实践
- 合理设置 `DOWNLOAD_DELAY` 和 `REQUEST_CONCURRENCY`
- 监控日志输出，及时调整策略
- 定期更新域名列表和选择器

## 🐛 常见问题

### Q: 爬取失败怎么办？
A: 检查以下几点：
- 确认目标网站可访问
- 检查CSS选择器是否需要更新
- 查看日志中的错误信息
- 尝试增加 `DOWNLOAD_DELAY`

### Q: 内容出现乱码？
A: 确保：
- 文件编码为UTF-8
- 检查 `FEED_EXPORT_ENCODING = "utf-8"`
- 使用支持UTF-8的文本编辑器查看

### Q: 如何爬取特定章节？
A: 修改 `content_spider.py` 中的章节选择逻辑，或手动编辑目录文件。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Scrapy](https://scrapy.org/) - 强大的爬虫框架
- [Python](https://python.org/) - 优秀的编程语言
- [lxml](https://lxml.de/) - 高效的XML/HTML解析库

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 [Issue](https://github.com/your-repo/issues)
- 发送邮件到 [your-email@example.com](mailto:your-email@example.com)

---

**⭐ 如果这个项目对你有帮助，请给个Star！**