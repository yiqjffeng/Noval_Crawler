# 📚 小说爬虫项目 (Book Crawler)

一个基于Scrapy的现代化小说爬虫系统，支持多域名自动切换、智能反爬策略，并提供完整的Web界面体验。

> 🌐 **现代化Web界面**: Vue3 + FastAPI 全栈解决方案
> ⚡ **一键启动**: 同时启动后端API和前端界面
> 📱 **响应式设计**: 支持手机、平板、电脑多端使用

## 🌟 功能特性

### 核心功能
- **智能搜索**: 关键词搜索小说，多域名自动切换
- **目录解析**: 自动提取完整章节结构
- **批量下载**: 支持选择性章节下载
- **格式导出**: TXT/EPUB双格式支持
- **进度管理**: 实时下载进度显示
- **历史记录**: 已下载小说管理

### 技术亮点
- **分布式架构**: 5个备用域名智能轮询
- **反爬策略**: 动态User-Agent、请求间隔随机化
- **并发控制**: 可配置的并发请求和写入
- **内容清洗**: 智能过滤广告和无效内容
- **UTF-8编码**: 完整中文支持，无乱码

## 🛠️ 技术栈

### 后端技术
- **Scrapy 2.11+**: 分布式爬虫框架
- **FastAPI 0.104+**: 现代异步Web框架
- **Python 3.13+**: 最新Python版本
- **lxml 4.9+**: 高效HTML解析
- **Pydantic**: 数据验证和序列化

### 前端技术
- **Vue 3.4+**: 渐进式JavaScript框架
- **TypeScript 5.0+**: 类型安全的JavaScript
- **Tailwind CSS 3.4+**: 实用优先的CSS框架
- **Vite 5.0+**: 下一代前端构建工具
- **Pinia**: Vue状态管理

### 开发工具
- **uv**: 现代化Python包管理
- **npm**: Node.js包管理
- **Git**: 版本控制

## 📁 项目目录结构

```
Book_Crawler/
├── book_crawler/          # Scrapy爬虫核心
│   ├── __init__.py
│   ├── config.py         # 爬虫配置（域名、选择器、并发）
│   ├── items.py          # 数据结构定义
│   ├── pipelines.py      # 数据处理管道
│   ├── settings.py       # Scrapy配置
│   ├── tools.py          # 工具函数
│   └── spiders/          # 爬虫实现
│       ├── search_spider.py   # 搜索爬虫
│       ├── catalog_spider.py  # 目录爬虫
│       └── content_spider.py  # 内容爬虫
├── fastapi_app/          # FastAPI后端服务
│   ├── main.py           # 主服务入口
│   ├── model.py          # 数据模型
│   └── README.md         # 后端文档
├── UI/                   # Vue3前端界面
│   ├── src/
│   │   ├── components/   # 可复用组件
│   │   ├── views/        # 页面视图
│   │   ├── stores/       # 状态管理
│   │   └── utils/        # 工具函数
│   ├── package.json      # 前端依赖
│   └── README.md         # 前端文档
├── novels/               # 下载的小说文件
├── docs/                 # 项目文档
├── pyproject.toml        # Python项目配置
├── uv.lock              # 依赖版本锁定
├── scrapy.cfg           # Scrapy配置
└── README.md            # 项目文档
```

## 🚀 快速开始

### 环境要求
- **Python 3.13+**: 后端运行环境
- **Node.js 18+**: 前端开发环境
- **Git**: 版本控制工具

### 📦 安装步骤

#### 1. 克隆项目
```bash
git clone [项目地址]
cd Book_Crawler
```

#### 2. 安装Python依赖
```bash
# 使用uv安装（推荐）
uv sync

# 或使用pip
pip install -r requirements.txt
```

#### 3. 安装前端依赖
```bash
cd UI
npm install
```

### 🎯 启动方案

#### 方案1: 一键启动（推荐）
```bash
# 启动后端API
cd fastapi_app && python main.py

# 新终端启动前端界面
cd UI && npm run dev

# 浏览器访问 http://localhost:3000
```

#### 方案2: 分步操作
```bash
# 步骤1：启动后端服务
cd fastapi_app
python main.py

# 步骤2：启动前端界面
cd UI
npm run dev

# 步骤3：浏览器访问 http://localhost:3000
```

#### 方案3: 高级用法
```bash
# 仅使用Scrapy命令行
scrapy crawl search -a keyword="剑来"
scrapy crawl catalog -a novel_url="/book/12345"
scrapy crawl content
```

### 📖 使用方法

### 🌐 方式一：Web界面（推荐）

#### 1. 启动完整服务
```bash
# 终端1：启动后端API
cd fastapi_app
python main.py

# 终端2：启动前端界面
cd UI
npm run dev
```

#### 2. 使用Web界面
- **本地访问**: http://localhost:3000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

#### 3. 操作流程
1. **搜索小说**: 在搜索框输入小说名称
2. **查看目录**: 点击搜索结果查看章节列表
3. **选择章节**: 勾选需要下载的章节范围
4. **开始下载**: 点击下载按钮，实时查看进度
5. **阅读小说**: 下载完成后在线阅读或导出文件

### ⚙️ 方式二：API接口调用

#### 搜索小说
```bash
curl -X POST "http://127.0.0.1:8000/api/search" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "剑来"}'
```

#### 获取目录
```bash
curl -X POST "http://127.0.0.1:8000/api/catalog" \
  -H "Content-Type: application/json" \
  -d '{"novel_id": 0}'
```

#### 开始下载
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

#### 查看状态
```bash
curl -X GET "http://127.0.0.1:8000/api/download/status/{task_id}"
```

### 🛠️ 方式三：Scrapy命令行

#### 搜索小说
```bash
scrapy crawl search -a keyword="剑来"
```

#### 获取目录
```bash
scrapy crawl catalog -a novel_url="/book/12345"
```

#### 下载内容
```bash
scrapy crawl content
```

## ⚙️ 配置说明

### 支持的域名
项目配置了5个备用域名，自动轮询：
- `97c286.cfd` (默认)
- `efebde4.cfd`
- `7535b44.cfd`
- `0ae247c57c.icu`
- `4a109.cfd`

### 核心配置 (book_crawler/config.py)
```python
# 并发控制
REQUEST_CONCURRENCY = 3      # 请求并发数
CONCURRENT_REQUESTS_PER_DOMAIN = 3  # 每个域名并发数
DOWNLOAD_DELAY = 2           # 请求间隔（秒）
RANDOMIZE_DOWNLOAD_DELAY = 1  # 随机延迟范围

# 重试配置
MAX_RETRY_TIMES = 3          # 每个域名重试次数
MAX_TOTAL_ATTEMPTS = 15      # 总尝试次数

# 输出目录
TEMP_OUTPUT_DIRECTORY = ./temp/  # 临时文件目录
LOG_DIRECTORY = ./temp/log/      # 日志文件目录
```

### 输出文件
- **搜索结果**: `./temp/search_{关键词}_result.json`
- **目录信息**: `./temp/catalog_{关键词}_result.json`
- **小说内容**: `./novels/{小说名}.txt` 或 `./novels/{小说名}.epub`

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

### Q: 前端无法连接后端？
A: 检查以下几点：
- 确认后端服务已启动：`python fastapi_app/main.py`
- 检查防火墙是否放行8000端口
- 查看控制台网络请求是否成功
- 确认前后端端口配置匹配

### Q: 爬取失败或超时？
A: 尝试以下解决方案：
- 检查目标网站是否可访问
- 增加请求延迟：`DOWNLOAD_DELAY = 3`
- 降低并发数：`REQUEST_CONCURRENCY = 1`
- 查看 `./temp/log/` 目录下的错误日志

### Q: 内容出现乱码或格式错误？
A: 确保：
- 文件编码为UTF-8（已默认配置）
- 使用现代浏览器或文本编辑器查看
- 检查CSS选择器是否需要更新
- 尝试不同的内容选择器配置

### Q: 如何部署到服务器？
A: 参考以下步骤：
- 后端：使用 `uvicorn main:app --host 0.0.0.0 --port 8000`
- 前端：构建后部署到Nginx：`npm run build`
- 配置反向代理，将API请求转发到后端

### Q: 如何爬取特定章节范围？
A: 在Web界面中：
- 使用章节选择器勾选需要的章节
- 在API调用中设置 `start_chapter` 和 `end_chapter` 参数
- 手动编辑 `./temp/catalog_关键词_result.json` 文件

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

## 🚀 部署指南

### 本地开发部署
```bash
# 启动后端
cd fastapi_app
python main.py

# 启动前端
cd UI
npm run dev
```

### 生产环境部署
```bash
# 构建前端
cd UI
npm run build

# 启动后端（生产模式）
cd fastapi_app
uvicorn main:app --host 0.0.0.0 --port 8000

# 使用Nginx反向代理前端静态文件
```

### Docker部署（即将支持）
```bash
# 一键启动所有服务
docker-compose up -d

# 访问 http://localhost
```

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 📧 提交 [GitHub Issue](https://github.com/your-repo/issues)
- 💬 项目讨论区
- 📖 查看详细文档：`./docs/`

---

**⭐ 如果这个项目对你有帮助，请给个Star！**

## 🎉 更新日志

### v2.0.0 (当前版本)
- ✨ 全新Vue3 + FastAPI架构
- 📱 响应式Web界面
- ⚡ 实时下载进度
- 🎯 智能章节选择
- 📚 EPUB格式支持

### v1.0.0
- 🕷️ 基础Scrapy爬虫
- 🔍 关键词搜索
- 📖 章节内容爬取
- 💾 TXT格式导出