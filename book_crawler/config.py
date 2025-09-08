#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
配置文件，存储爬虫需要的各种配置参数
"""
import os

# 支持的域名列表
SUPPORTED_DOMAINS = [
    "97c286.cfd",
    "efebde4.cfd",
    "7535b44.cfd",
    "0ae247c57c.icu",
    "4a109.cfd"
]

# 默认域名
DEFAULT_DOMAIN = "97c286.cfd"

# 请求头配置（基础头，referer/cookie 在 spider 动态生成）
# 请求头配置
REQUEST_HEADERS = {
    "accept": "application/json",
    "accept-encoding": "gzip, deflate",  # 🚫 去掉 br 和 zstd
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
}

# 默认关键词
DEFAULT_KEYWORD = "凡人修仙传"

#当前关键词
CURRENT_KEYWORD = "凡人修仙传"

# 重试配置
MAX_RETRY_TIMES = 3           # 每个域名最多重试次数
MAX_TOTAL_ATTEMPTS = len(SUPPORTED_DOMAINS) * MAX_RETRY_TIMES
RETRY_DELAY = 3               # 秒


################################### 输出配置

# 日志/输出配置
OUTPUT_DIRECTORY = "output"
ERROR_LOG_FILE = os.path.join(OUTPUT_DIRECTORY,"error_response.json")
OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, "search_result.json")

# 目录爬虫配置
CATALOG_OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, "catalog_result.json")

# 内容爬虫配置
CONTENT_OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, f"{DEFAULT_KEYWORD}.txt")

############################## 运行配置

# 并发控制配置
REQUEST_CONCURRENCY = 3      # 请求并发数（降低以避免反爬虫）
WRITE_CONCURRENCY = 5        # 写入并发数

# 反爬虫配置
DOWNLOAD_DELAY = 2           # 请求间隔（秒）
RANDOMIZE_DOWNLOAD_DELAY = 0.5  # 随机延迟范围
REDIRECT_MAX_TIMES = 3       # 最大重定向次数

# 内容格式配置
CHAPTER_SEPARATOR = "\n\n\n--------\n\n\n"  # 章节分隔符
PARAGRAPH_INDENT = "　　"                    # 段首缩进

# 内容页面CSS选择器
CONTENT_CSS_SELECTORS = {
    'title': 'h1::text',                                    # 章节标题选择器
    'content': '#chaptercontent *::text',                   # 章节内容选择器（包含所有子元素）
    'content_fallback': '.Readarea *::text',               # 内容备用选择器
    'content_alternative': '.ReadAjax_content *::text'     # 第三备用选择器
}

# 当前域名（会被 spider 动态更新）
CURRENT_DOMAIN = DEFAULT_DOMAIN
