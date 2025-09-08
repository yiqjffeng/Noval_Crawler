# 小说爬虫项目

这是一个基于Scrapy的小说爬虫项目，支持搜索小说并获取章节目录信息。

## 功能特性

- 🔍 **搜索功能**: 支持关键词搜索小说
- 📚 **目录爬取**: 获取小说的完整章节列表
- 🎮 **交互界面**: 用户友好的选择界面
- 🌐 **多域名支持**: 自动切换备用域名
- 💾 **数据保存**: JSON格式保存搜索和目录结果

## 项目结构

```
book_crawler/
├── book_crawler/
│   ├── spiders/
│   │   ├── search_spider.py      # 搜索爬虫
│   │   └── catalog_spider.py      # 目录爬虫
│   ├── items.py                  # 数据模型定义
│   ├── config.py                 # 配置文件
│   └── settings.py               # Scrapy设置
├── output/                       # 输出目录
│   ├── search_result.json        # 搜索结果
│   └── catalog_result.json       # 目录结果
├── user_interface.py             # 用户交互界面
├── run_demo.py                   # 演示脚本
└── README.md                     # 说明文档
```

## 使用方法

### 方法一：使用演示脚本（推荐）

```bash
cd book_crawler
python run_demo.py
```

### 方法二：分步执行

1. **搜索小说**
```bash
cd book_crawler
scrapy crawl search -a keyword=剑来
```

2. **选择并爬取目录**
```bash
python user_interface.py
```

### 方法三：直接爬取指定小说目录

```bash
cd book_crawler
scrapy crawl catalog -a novel_url=/look/9412/
```

## 数据格式

### 搜索结果 (search_result.json)
```json
[
    {
        "url_list": "/look/9412/",
        "url_img": "https://www.bqgl.cc/bookimg/1/1000.jpg",
        "articlename": "剑来",
        "author": "烽火戏诸侯",
        "intro": "大千世界，无奇不有..."
    }
]
```

### 目录结果 (catalog_result.json)
```json
{
    "novel_info": {
        "novel_id": "/look/9412/",
        "novel_title": "剑来",
        "author": "烽火戏诸侯",
        "total_chapters": 1200,
        "domain": "www.bqgl.cc",
        "detail_url": "https://www.bqgl.cc/look/9412/"
    },
    "chapters": [
        {
            "title": "第一章 惊蛰",
            "url": "https://www.bqgl.cc/look/9412/1.html"
        }
    ]
}
```

## 配置说明

主要配置在 `book_crawler/config.py` 中：

### 基础配置
- `SUPPORTED_DOMAINS`: 支持的域名列表
- `DEFAULT_DOMAIN`: 默认使用的域名
- `MAX_RETRY_TIMES`: 每个域名的最大重试次数
- `OUTPUT_DIRECTORY`: 输出文件目录

### 输出文件配置
- `OUTPUT_FILE`: 搜索结果文件路径
- `CATALOG_OUTPUT_FILE`: 目录结果文件路径

### 章节过滤配置
- `INVALID_CHAPTER_KEYWORDS`: 无效章节关键词列表
- `INVALID_CHAPTER_PREFIXES`: 无效章节前缀列表
- `NAVIGATION_KEYWORDS`: 导航关键词列表

### CSS选择器配置
- `CSS_SELECTORS`: 页面元素选择器配置

详细配置说明请参考 [CONFIG_GUIDE.md](CONFIG_GUIDE.md)

## 依赖要求

- Python >= 3.13
- Scrapy >= 2.11.0
- requests >= 2.31.0
- lxml >= 4.9.0

## 安装依赖

```bash
pip install scrapy requests lxml
```

或使用uv：

```bash
uv sync
```

## 注意事项

1. 请遵守网站的robots.txt和使用条款
2. 建议设置合理的下载延迟，避免对服务器造成过大压力
3. 如遇到反爬虫措施，程序会自动切换备用域名
4. 输出文件保存在 `output/` 目录下

## 扩展功能

当前实现了搜索和目录爬取功能，后续可以扩展：

- 章节内容爬取
- 多线程下载
- 数据库存储
- Web界面
- 更多网站支持

## 许可证

本项目仅供学习和研究使用，请勿用于商业用途。