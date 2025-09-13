# -*- coding: utf-8 -*-
"""
配置文件，存储爬虫需要的各种配置参数
"""
import datetime
import os
from random import choice
from config import (
    TEMP_OUTPUT_DIRECTORY,
    REQUEST_CONCURRENCY,
    WRITE_CONCURRENCY,
    CONCURRENT_REQUESTS_PER_DOMAIN,
    DOWNLOAD_DELAY,
    RANDOMIZE_DOWNLOAD_DELAY
)
from book_crawler.tools import get_supported_domains

# 支持的域名列表
SUPPORTED_DOMAINS = get_supported_domains()
# 默认域名
DEFAULT_DOMAIN = SUPPORTED_DOMAINS[0]

# 当前域名（会被 spider 动态更新）
CURRENT_DOMAIN = DEFAULT_DOMAIN

# 请求头配置（基础头，referer/cookie 在 spider 动态生成）
# 请求头配置
USER_AGENT = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763'
]

REQUEST_HEADERS = {
    "accept": "application/json",
    "accept-encoding": "gzip, deflate",  # 🚫 去掉 br 和 zstd
    "user-agent": choice(USER_AGENT),
}

# 默认关键词
DEFAULT_KEYWORD = "剑来"

KEYWORD = DEFAULT_KEYWORD

# 重试配置
MAX_RETRY_TIMES = 3  # 每个域名最多重试次数
MAX_TOTAL_ATTEMPTS = len(SUPPORTED_DOMAINS) * MAX_RETRY_TIMES
RETRY_DELAY = 3  # 秒

# 日志/输出配置 - 确保使用项目根目录的output
TEMP_OUTPUT_DIRECTORY = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'temp')

# 日志目录
LOG_DIRECTORY = os.path.join(TEMP_OUTPUT_DIRECTORY, 'log')

ERROR_LOG_FILE = os.path.join(LOG_DIRECTORY, f"{datetime.datetime.now()}.log")

# 搜索结果输出文件
def get_search_output_file(keyword=None):
    """根据当前关键词动态生成输出文件路径"""
    key = keyword or KEYWORD
    return os.path.join(TEMP_OUTPUT_DIRECTORY, f"search_{key}_result.json")

# 目录爬虫配置
def get_catalog_output_file(keyword=None):
    """根据当前关键词动态生成输出文件路径"""
    key = keyword or KEYWORD
    return os.path.join(TEMP_OUTPUT_DIRECTORY, f"catalog_{key}_result.json")

# 并发控制配置
REQUEST_CONCURRENCY = REQUEST_CONCURRENCY# 请求并发数（降低以避免反爬虫）
WRITE_CONCURRENCY = WRITE_CONCURRENCY  # 写入并发数
CONCURRENT_REQUESTS_PER_DOMAIN = CONCURRENT_REQUESTS_PER_DOMAIN  # 每个域名的并发数

# 反爬虫配置
DOWNLOAD_DELAY = DOWNLOAD_DELAY  # 请求间隔（秒）
RANDOMIZE_DOWNLOAD_DELAY = RANDOMIZE_DOWNLOAD_DELAY  # 随机延迟范围

# 内容格式配置
CHAPTER_SEPARATOR = "\n\n\n--------\n\n\n"  # 章节分隔符
PARAGRAPH_INDENT = "　　"  # 段首缩进

# 内容页面CSS选择器
CONTENT_CSS_SELECTORS = {
    'title': 'h1::text',  # 章节标题选择器
    'content': '#chaptercontent *::text',  # 章节内容选择器（包含所有子元素）
    'content_fallback': '.Readarea *::text',  # 内容备用选择器
    'content_alternative': '.ReadAjax_content *::text'  # 第三备用选择器
}

# 章节过滤配置
INVALID_CHAPTER_KEYWORDS = [
    '展开全部章节', '展开', '收起', '---', '<<<', '>>>',
    '返回目录', '上一页', '下一页', '首页', '尾页', '点此报错', '加入书签',
    '收藏本站'
]

INVALID_CHAPTER_PREFIXES = ['展开', '收起', '<<<', '>>>']

NAVIGATION_KEYWORDS = ['请假条', '单章感言', '作者有话说']

# 目录爬取CSS选择器配置
CSS_SELECTORS = {
    'title': 'h1::text',
    'title_fallback': '.info h1::text',
    'author_spans': '.small span::text',
    'chapter_links': '.listmain dl dd a',
    'chapter_title': '::text',
    'chapter_url': '::attr(href)'
}
