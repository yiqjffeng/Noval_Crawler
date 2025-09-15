# 📚 小说爬虫项目 (Book Crawler)

一个基于Scrapy的简洁小说爬虫系统，支持多域名自动切换，并提供多种使用方式。

## 🚀 功能特性
- 小说搜索与目录解析
- 批量下载与章节选择
- TXT/EPUB双格式支持
- 实时下载进度显示
- 多域名自动轮询
- 智能反爬策略

## 📁 项目结构

```
Book_Crawler/
├── book_crawler/          # Scrapy爬虫核心
│   ├── spiders/           # 爬虫实现（搜索、目录、内容）
│   └── config.py          # 爬虫配置
├── fastapi_app/           # FastAPI后端服务
│   ├── main.py            # 主服务入口
│   └── model.py           # 数据模型
├── UI/                    # Vue3前端界面
├── novels/                # 下载的小说文件
├── config.py              # 项目基础配置
├── quick_start.py         # 命令行交互工具
└── requirements.txt       # Python依赖列表
```

## 🛠️ 环境要求
- Python 3.13+
- Node.js 16+（如使用Web界面）

## 📦 安装步骤

1. 克隆项目并进入目录
```bash
git clone https://github.com/yiqjffeng/Noval_Crawler.git
cd Book_Crawler
```

2. 安装Python依赖
```bash
pip install -r requirements.txt
```

3. 安装前端依赖（如使用Web界面）
```bash
cd UI && npm install
```

## 🎯 使用方式

### 🚀 方式一：命令行交互工具（最简单）
```bash
python quick_start.py
```

### 🌐 方式二：Web界面
1. 启动后端
```bash
cd fastapi_app && python main.py
```

2. 启动前端
```bash
cd UI && npm run dev
```

3. 访问：http://localhost:3000

### ⚙️ 方式三：API调用
```bash
# 搜索小说
curl -X POST "http://127.0.0.1:8000/api/search" -H "Content-Type: application/json" -d '{"keyword": "剑来"}'

# 下载小说
curl -X POST "http://127.0.0.1:8000/api/download/start" -H "Content-Type: application/json" -d '{"novel_url": "/book/29799/", "book_name": "剑来", "start_chapter": 1, "end_chapter": 100, "mode": "txt"}'
```

## ⚙️ 配置说明

核心配置文件：
- `config.py` - 项目基础配置
- `book_crawler/config.py` - 爬虫具体配置

主要配置项：
```python
# 并发控制
REQUEST_CONCURRENCY = 3      # 请求并发数

# 反爬配置
DOWNLOAD_DELAY = 2           # 请求间隔（秒）
RANDOMIZE_DOWNLOAD_DELAY = 1  # 随机延迟

# 输出目录
NOVELS_OUTPUT_DIRECTORY = ./novels/  # 小说输出目录
```

## 🛡️ 反爬策略
- User-Agent轮换
- 请求间隔随机化
- 多域名自动切换
- 并发控制

## 🐛 常见问题

### 爬取失败或超时
- 增加请求延迟：`DOWNLOAD_DELAY = 3`
- 降低并发数：`REQUEST_CONCURRENCY = 1`
- 检查是否需要更新支持的域名

### 前端无法连接后端
- 确认后端服务已启动：`python fastapi_app/main.py`
- 检查防火墙配置

## 📄 许可证
MIT 许可证

---
**⭐ 觉得好用请给个Star！**