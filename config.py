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

# 搜索输出文件
SEARCH_OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, "search_result.json")

# 错误日志文件
ERROR_LOG_FILE = os.path.join(OUTPUT_DIRECTORY, f"{time.time()}.log")

# 目录输出文件
CATALOG_OUTPUT_FILE = os.path.join(OUTPUT_DIRECTORY, "catalog_result.json")

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

# ==================== 验证配置 ====================
def validate_config():
    """验证并创建必要的目录"""
    print("🔍 验证基础配置...")
    
    # 检查并创建输出目录
    if not os.path.exists(OUTPUT_DIRECTORY):
        os.makedirs(OUTPUT_DIRECTORY)
        print(f"✅ 创建输出目录: {OUTPUT_DIRECTORY}")
    
    # 检查文件路径
    paths_to_check = [
        SEARCH_OUTPUT_FILE,
        ERROR_LOG_FILE,
        CATALOG_OUTPUT_FILE
    ]
    
    for path in paths_to_check:
        dir_path = os.path.dirname(path)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            print(f"✅ 创建目录: {dir_path}")
    
    print("✅ 基础配置验证完成")
