"""
基础配置文件 - 集中管理输出路径和基础设置
"""

import os
import time

# ==================== 获取项目路径 ====================
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# ==================== 输出目录配置 ====================
OUTPUT_DIRECTORY = os.path.join(PROJECT_ROOT ,'output')

# 确保输出目录存在
os.makedirs(OUTPUT_DIRECTORY, exist_ok=True)

# ==================== 文件输出路径配置 ====================

# 日志目录
LOG_DIRECTORY = os.path.join(OUTPUT_DIRECTORY, 'log')
os.makedirs(LOG_DIRECTORY, exist_ok=True)

# 错误日志文件
ERROR_LOG_FILE = os.path.join(LOG_DIRECTORY, f"{time.time()}.log")


# 内容输出文件（动态生成）
def get_content_txt_filename(keyword='剑来'):
    """获取TXT格式的小说文件名"""
    return os.path.join(OUTPUT_DIRECTORY, f"{keyword}.txt")

def get_content_epub_filename(keyword='剑来'):
    """获取EPUB格式的小说文件名"""
    return os.path.join(OUTPUT_DIRECTORY, f"{keyword}.epub")

# 进度文件模板
def get_progress_filename(task_id):
    """获取进度文件名"""
    return os.path.join(OUTPUT_DIRECTORY, f"progress_{task_id}.json")

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
