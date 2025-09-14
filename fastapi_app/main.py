import os

import requests
from fastapi import FastAPI, HTTPException, Query, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json
import uuid
import signal
import atexit
import glob
from datetime import datetime
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import sys
# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from fastapi_app.model import SearchRequest, CatalogRequest,DownloadRequest,DownloadMode

from config import (
    TEMP_OUTPUT_DIRECTORY,
    get_content_txt_filename,
    get_content_epub_filename,
    FASTAPI_HOST,
    FASTAPI_PORT,
    CORS_ORIGINS,
    CORS_ALLOW_CREDENTIALS,
    CORS_ALLOW_METHODS,
    CORS_ALLOW_HEADERS,
    CORS_EXPOSE_HEADERS,
    CORS_MAX_AGE,
    THREAD_POOL_MAX_WORKERS,
    TEMP_CLEANUP_PATTERNS,
    DEFAULT_BOOK_NAME,
    DEFAULT_START_CHAPTER,
    DEFAULT_END_CHAPTER,
    DEFAULT_DOWNLOAD_MODE,
    SPIDER_TIMEOUT
)
from book_crawler.config import get_catalog_output_file, get_search_output_file

app = FastAPI(title="小说爬虫API", description="基于Scrapy的小说爬虫FastAPI接口")

# CORS配置 - 使用config.py中的可配置项
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=CORS_ALLOW_METHODS,
    allow_headers=CORS_ALLOW_HEADERS,
    expose_headers=CORS_EXPOSE_HEADERS,
    max_age=CORS_MAX_AGE,
)

app.state.current_book_name = None
app.state.current_keyword = None

# 任务管理 - 使用config.py中的可配置线程池大小
executor = ThreadPoolExecutor(max_workers=THREAD_POOL_MAX_WORKERS)
tasks = {}  # 存储任务状态


# 清理函数 - 使用config.py中的清理模式配置
def cleanup_on_exit():
    """程序退出时清理临时文件"""
    try:
        # 使用config.py中配置的清理模式
        for pattern in TEMP_CLEANUP_PATTERNS:
            for file_path in glob.glob(os.path.join(TEMP_OUTPUT_DIRECTORY, pattern)):
                try:
                    os.remove(file_path)
                    print(f"已清理临时文件: {file_path}")
                except Exception as e:
                    print(f"清理文件失败 {file_path}: {e}")
    except Exception as e:
        print(f"清理过程出错: {e}")


# 注册清理函数
atexit.register(cleanup_on_exit)


# 处理信号
def signal_handler(signum, frame):
    """处理中断信号"""
    print(f"接收到信号 {signum}，开始清理...")
    cleanup_on_exit()
    exit(0)


# 注册信号处理器
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


# OPTIONS预检请求处理 - 更全面的路径匹配
@app.options("/api/{path:path}")
async def options_handler(path: str):
    """
    处理所有API路径的OPTIONS预检请求
    包括: /api/search, /api/catalog, /api/download/start, /api/download/tasks 等
    """
    return {
        "message": "OK",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "path": f"/api/{path}"
    }


# 为特定端点添加OPTIONS支持
@app.options("/api/download/tasks")
async def options_download_tasks():
    """为下载任务列表接口提供OPTIONS支持"""
    return {"message": "OK", "method": "GET"}


@app.options("/health")
async def options_health():
    """为健康检查接口提供OPTIONS支持"""
    return {"message": "OK", "method": "GET"}


# 支持两种请求方式的通用依赖
def get_search_params(
        keyword: Optional[str] = Query(None, description="搜索关键词")
) -> SearchRequest:
    return SearchRequest(keyword=keyword)


def get_catalog_params(
        novel_id: Optional[int] = Query(None, description="小说ID")
) -> CatalogRequest:
    return CatalogRequest(novel_id=novel_id)


def get_download_params(
        novel_url: Optional[str] = Query(None, description="小说URL"),
        book_name: Optional[str] = Query(DEFAULT_BOOK_NAME, description="书名"),
        start_chapter: Optional[int] = Query(DEFAULT_START_CHAPTER, description="起始章节"),
        end_chapter: Optional[int] = Query(DEFAULT_END_CHAPTER, description="结束章节(-1表示全部)"),
        mode: Optional[DownloadMode] = Query(DEFAULT_DOWNLOAD_MODE, description="下载格式"),
) -> DownloadRequest:
    path = get_content_txt_filename(book_name) if mode == "txt" else get_content_epub_filename(book_name)
    return DownloadRequest(
        novel_url=novel_url,
        book_name=book_name,
        start_chapter=start_chapter,
        end_chapter=end_chapter,
        mode=mode
    )


def run_scrapy_spider(spider_name: str, args: List[str] = []) -> Dict[str, Any]:
    """
    运行Scrapy爬虫并返回结果
    """
    try:
        # 构建命令
        cmd = ["scrapy", "crawl", spider_name] + args
        print(f"执行命令: {' '.join(cmd)}")

        # 执行Scrapy爬虫 - 使用config.py中的超时配置
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=".", timeout=SPIDER_TIMEOUT)

        if result.returncode != 0:
            raise Exception(f"爬虫执行失败: {result.stderr}")

        return {"success": True, "stdout": result.stdout, "stderr": result.stderr}
    except subprocess.TimeoutExpired:
        raise Exception("爬虫执行超时")
    except Exception as e:
        raise Exception(f"执行爬虫时出错: {str(e)}")


def run_download_task(task_id: str, novel_url: str, keyword: str, book_name: str, start_chapter: int, end_chapter: int,
                      mode: DownloadMode, output_path: str):
    """
    运行下载任务
    """
    try:
        tasks[task_id]["status"] = "running"
        tasks[task_id]["message"] = "正在获取目录..."
        catalog_file = get_catalog_output_file(app.state.current_book_name)
        if not os.path.exists(catalog_file):
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["message"] = "获取目录失败,目录文件不存在"
            return

        # 根据mode选择对应的pipeline
        if mode == DownloadMode.epub:
            pipeline_setting = 'ITEM_PIPELINES={"book_crawler.pipelines.EpubWriterPipeline":300}'
        else:  # txt模式
            pipeline_setting = 'ITEM_PIPELINES={"book_crawler.pipelines.TxtWriterPipeline":300}'

        # 运行内容爬虫
        args = [
            "-a", f"start_idx={start_chapter}",
            "-a", f"end_idx={end_chapter}",
            "-a", f"task_id={task_id}",
            "-a", f'book_name={book_name}',
            "-a", f'mode={mode.value}',
            "-a", f'keyword={keyword}',
            "-s", pipeline_setting
        ]

        result = run_scrapy_spider("content", args)
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["message"] = "下载完成"

    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["message"] = str(e)
        tasks[task_id]["error"] = str(e)


# 搜索小说 - 支持query和json两种方式
@app.post("/api/search")
async def novel_search(
        request: SearchRequest = Body(None),
        keyword: str = Query(None, description="搜索关键词")
):
    """
    小说搜索接口 - 支持query参数和JSON请求体两种方式
    
    使用方式：
    1. JSON方式：POST {"keyword": "斗破苍穹"}
    2. Query方式：POST /api/search?keyword=斗破苍穹
    """
    try:
        # 优先使用JSON请求体，其次使用query参数
        search_keyword = request.keyword if request and request.keyword else keyword

        if not search_keyword:
            raise HTTPException(status_code=400, detail="必须提供搜索关键词")

        app.state.current_book_name = search_keyword
        app.state.current_keyword = search_keyword

        # 读取搜索结果
        search_output_file = get_search_output_file(search_keyword)

        if os.path.exists(search_output_file):
            with open(search_output_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            return {"status": "success", "data": data, "message": "搜索完成", "keyword": search_keyword}

        # 执行Scrapy搜索爬虫
        result = run_scrapy_spider("search", ["-a", f"keyword={search_keyword}"])

        if os.path.exists(search_output_file):
            with open(search_output_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            return {"status": "success", "data": data, "message": "搜索完成", "keyword": search_keyword}
        else:
            # 如果没有找到结果文件，返回空数组
            return {"status": "success", "data": [], "message": "搜索完成，但未找到结果", "keyword": search_keyword}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 获取小说目录 - 支持query和json两种方式
@app.post("/api/catalog")
async def novel_catalog(
        request: CatalogRequest = Body(None),
        novel_id: int = Query(None, description="小说ID")
):
    """
    获取小说目录接口 - 支持query参数和JSON请求体两种方式
    
    使用方式：
    1. JSON方式：POST {"novel_id": 1}
    2. Query方式：POST /api/catalog?novel_id=1
    """
    try:
        # 优先使用JSON请求体，其次使用query参数
        novel_id_value = request.novel_id if request and request.novel_id else novel_id
        novel_id_value -= 1
        if novel_id_value is None:
            raise HTTPException(status_code=400, detail="必须提供小说ID")


        # 从搜索结果中获取对应小说的URL
        search_file = get_search_output_file(app.state.current_keyword)
        if not os.path.exists(search_file) or not app.state.current_keyword:
            raise HTTPException(status_code=404, detail="搜索结果文件不存在，请先执行搜索")

        with open(search_file, "r", encoding="utf-8") as f:
            search_results = json.load(f)

        if novel_id_value >= len(search_results):
            raise HTTPException(status_code=404, detail="小说ID超出范围")

        novel_info = search_results[novel_id_value]
        novel_url = novel_info["url_list"]
        book_name = novel_info.get("articlename", "未知书名")
        app.state.current_book_name = book_name

        catalog_file = get_catalog_output_file(app.state.current_book_name)
        if os.path.exists(catalog_file):
            with open(catalog_file, "r", encoding="utf-8") as f:
                catalog_data = json.load(f)
            return {
                "status": "success",
                "data": catalog_data,
                "message": "目录获取完成",
                "novel_id": novel_id_value,
                "book_name": book_name,
                "novel_url": novel_url
            }

        # 执行Scrapy目录爬虫
        result = run_scrapy_spider("catalog", ["-a", f"novel_url={novel_url}", "-a", f"keyword={book_name}"])

        # 读取目录结果

        if os.path.exists(catalog_file):
            with open(catalog_file, "r", encoding="utf-8") as f:
                catalog_data = json.load(f)
            return {
                "status": "success",
                "data": catalog_data,
                "message": "目录获取完成",
                "novel_id": novel_id_value,
                "book_name": book_name,
                "novel_url": novel_url
            }
        else:
            return {
                "status": "success",
                "data": [],
                "message": "目录获取完成，但未找到结果",
                "novel_id": novel_id_value,
                "book_name": book_name,
                "novel_url": novel_url
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 开始下载小说 - 支持query和json两种方式
@app.post("/api/download/start")
async def start_download(
        request: DownloadRequest = Body(None),
        novel_url: str = Query(None, description="小说URL"),
        book_name: str = Query("temp", description="书名"),
        start_chapter: int = Query(1, description="起始章节"),
        end_chapter: int = Query(-1, description="结束章节(-1表示全部)"),
        mode: DownloadMode = Query("txt", description="下载格式")
):
    """
    开始下载小说接口 - 支持query参数和JSON请求体两种方式
    
    使用方式：
    1. JSON方式：POST {"novel_url": "https://example.com/novel", "book_name": "斗破苍穹", "start_chapter": 1, "end_chapter": 10, "mode": "txt"}
    2. Query方式：POST /api/download/start?novel_url=https://example.com/novel&book_name=斗破苍穹&start_chapter=1&end_chapter=10&mode=txt
    """
    try:
        # 优先使用JSON请求体，其次使用query参数
        if request and any([request.novel_url, request.book_name, request.start_chapter != 1, request.end_chapter != -1,
                            request.mode != "txt"]):
            download_data = request
        else:
            download_data = DownloadRequest(
                novel_url=novel_url,
                book_name=book_name,
                start_chapter=start_chapter,
                end_chapter=end_chapter,
                mode=mode
            )

        if not download_data.novel_url:
            raise HTTPException(status_code=400, detail="必须提供小说URL")

        # 生成任务ID
        task_id = str(uuid.uuid4())

        # 根据模式选择输出文件路径
        if download_data.mode == DownloadMode.txt:
            path = get_content_txt_filename(download_data.book_name)
        else:
            path = get_content_epub_filename(download_data.book_name)

        # 初始化任务状态
        tasks[task_id] = {
            "status": "running",
            "novel_url": download_data.novel_url,
            "task_id": task_id,
            "book_name": download_data.book_name,
            "start_chapter": download_data.start_chapter,
            "end_chapter": download_data.end_chapter,
            "mode": download_data.mode,
            "path": path,
            "progress": 0,
            "current_chapter": 0,
            "total_chapters": 0,
            "message": "任务已启动",
            "start_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        # 启动下载任务
        executor.submit(
            run_download_task,
            task_id=task_id,
            novel_url=download_data.novel_url,
            keyword=app.state.current_book_name,
            book_name=download_data.book_name,
            start_chapter=download_data.start_chapter,
            end_chapter=download_data.end_chapter,
            mode=download_data.mode,
            output_path=path,
        )

        return {
            "status": "success",
            "task_id": task_id,
            "message": "下载任务已启动",
            "details": {
                "novel_url": download_data.novel_url,
                "book_name": download_data.book_name,
                "start_chapter": download_data.start_chapter,
                "end_chapter": download_data.end_chapter,
                "mode": download_data.mode,
                "path": path,
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 获取下载状态
@app.get("/api/download/status/{task_id}")
async def download_status(task_id: str):
    """
    获取下载状态
    """
    try:
        # 检查任务是否存在
        if task_id not in tasks:
            raise HTTPException(status_code=404, detail="任务不存在")

        # 读取进度文件
        progress_file = os.path.join(TEMP_OUTPUT_DIRECTORY, f"progress_{task_id}.json")
        progress_data = None

        if os.path.exists(progress_file):
            try:
                with open(progress_file, "r", encoding="utf-8") as f:
                    progress_data = json.load(f)
            except Exception as e:
                pass

        # 构建响应
        response_data = {
            "task_id": task_id,
            "status": tasks[task_id]["status"],
            "book_name": tasks[task_id]["book_name"],
            "novel_url": tasks[task_id]["novel_url"],
            "start_chapter": tasks[task_id]["start_chapter"],
            "end_chapter": tasks[task_id]["end_chapter"]
        }

        if progress_data:
            response_data.update({
                "current": progress_data.get("current", 0),
                "total": progress_data.get("total", 0),
                "percentage": progress_data.get("percentage", 0),
                "failed_chapters": progress_data.get("failed_chapters", [])
            })
        else:
            response_data.update({
                "current": 0,
                "total": 0,
                "percentage": 0,
                "failed_chapters": []
            })

        return {"status": "success", "data": response_data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 停止下载
@app.post("/api/download/stop/{task_id}")
async def stop_download(task_id: str):
    """
    停止下载任务
    """
    try:
        if task_id not in tasks:
            raise HTTPException(status_code=404, detail="任务不存在")

        # 标记任务为停止状态
        tasks[task_id]["status"] = "stopped"

        return {"status": "success", "task_id": task_id, "message": "下载任务已停止"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 获取任务列表
@app.get("/api/download/tasks")
async def get_tasks():
    """
    获取所有下载任务列表
    """
    try:
        task_list = []
        for task_id, task_info in tasks.items():
            progress_file = os.path.join(TEMP_OUTPUT_DIRECTORY, f"progress_{task_id}.json")
            progress_data = None

            if os.path.exists(progress_file):
                try:
                    with open(progress_file, "r", encoding="utf-8") as f:
                        progress_data = json.load(f)
                except Exception as e:
                    pass
            task_list.append({
                "task_id": task_id,
                "status": task_info["status"],
                "book_name": task_info["book_name"],
                "novel_url": task_info["novel_url"],
                "start_chapter": task_info["start_chapter"],
                "current_chapter": progress_data.get("current", 0),
                "end_chapter": task_info["end_chapter"],
                "start_time": task_info["start_time"]
            })

        return {"status": "success", "data": task_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 健康检查接口
@app.get("/health")
async def health_check():
    """
    健康检查接口
    """
    try:
        response = requests.get("https://www.baidu.com")
        return {"status": "healthy", "message": "服务运行正常"}
    except Exception as e:
        return {"status": "unhealthy", "message": "无法连接到互联网"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=FASTAPI_HOST, port=FASTAPI_PORT)
