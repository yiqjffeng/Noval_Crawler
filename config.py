"""
基础配置文件 - 集中管理输出路径和基础设置
"""

import os
import time

# ==================== 获取项目路径 ====================
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# ==================== 输出目录配置 ====================
TEMP_OUTPUT_DIRECTORY = os.path.join(PROJECT_ROOT ,'temp')

# 移除自动创建output目录逻辑
# os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)

# ==================== 文件输出路径配置 ====================

# 日志目录
# LOG_DIRECTORY = os.path.join(OUTPUT_DIRECTORY, 'log')
# # os.makedirs(LOG_DIRECTORY, exist_ok=True)

# 错误日志文件
ERROR_LOG_FILE = os.path.join(TEMP_OUTPUT_DIRECTORY, f"{time.time()}.log")

NOVELS_OUTPUT_DIRECTORY = os.path.join(PROJECT_ROOT , 'novels')

# 内容输出文件（动态生成）
def get_content_txt_filename(book_name='剑来'):
    """获取TXT格式的小说文件名"""
    return os.path.join(NOVELS_OUTPUT_DIRECTORY, f"{book_name}.txt")

def get_content_epub_filename(book_name='剑来'):
    """获取EPUB格式的小说文件名"""
    return os.path.join(NOVELS_OUTPUT_DIRECTORY, f"{book_name}.epub")

# 进度文件模板
def get_progress_filename(task_id):
    """获取进度文件名"""
    return os.path.join(TEMP_OUTPUT_DIRECTORY, f"progress_{task_id}.json")

# ==================== FastAPI相关配置 ====================

# FastAPI服务器配置
FASTAPI_HOST = "127.0.0.1"
FASTAPI_PORT = 8000

# 并发控制配置
REQUEST_CONCURRENCY = 3      # 请求并发数（降低以避免反爬虫）
WRITE_CONCURRENCY = 5        # 写入并发数
CONCURRENT_REQUESTS_PER_DOMAIN = 3           # 每个域名的并发数

# 反爬虫配置
DOWNLOAD_DELAY = 2           # 请求间隔（秒）
RANDOMIZE_DOWNLOAD_DELAY = 1  # 随机延迟范围

# ==================== FastAPI应用配置 ====================

# CORS配置 - 可经常性变动的配置
CORS_ORIGINS = [
    "http://localhost:3000",  # React/Vue dev server
    "http://127.0.0.1:3000",  # React/Vue dev server
    "http://localhost:3001",  # Vite dev server (备用端口)
    "http://127.0.0.1:3001",  # Vite dev server (备用端口)
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",  # Vite dev server
    "http://localhost:8080",  # Vue CLI dev server
    "http://127.0.0.1:8080",  # Vue CLI dev server
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"]
CORS_ALLOW_HEADERS = [
    "*",
    "Accept",
    "Accept-Language",
    "Content-Language",
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
]
CORS_EXPOSE_HEADERS = ["*"]
CORS_MAX_AGE = 86400  # 24小时缓存预检请求

# 线程池配置
THREAD_POOL_MAX_WORKERS = 3  # 线程池最大工作线程数

# 临时文件清理配置
TEMP_CLEANUP_PATTERNS = [
    "*.json",  # 搜索结果和目录缓存
    "progress_*",  # 进度文件
    "*.tmp",  # 临时文件
    "*.cache"  # 缓存文件
]

# API接口默认值配置
DEFAULT_BOOK_NAME = "temp"
DEFAULT_START_CHAPTER = 1
DEFAULT_END_CHAPTER = -1  # -1表示全部章节
DEFAULT_DOWNLOAD_MODE = "txt"  # txt或epub

# Scrapy爬虫超时配置（秒）
SPIDER_TIMEOUT = 3600  # 1小时
