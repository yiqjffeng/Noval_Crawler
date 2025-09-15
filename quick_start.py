#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
小说爬虫命令行交互启动工具
提供简洁的命令行界面来搜索、查看目录和下载小说
"""

import os
import sys
import json
import subprocess
import time
import uuid
import glob
import atexit
from typing import List, Dict, Any, Optional
import threading

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import (
    TEMP_OUTPUT_DIRECTORY,
    get_content_txt_filename,
    get_content_epub_filename,
    SPIDER_TIMEOUT,
    TEMP_CLEANUP_PATTERNS
)
from book_crawler.config import get_catalog_output_file, get_search_output_file

# 确保临时目录存在
os.makedirs(TEMP_OUTPUT_DIRECTORY, exist_ok=True)

def cleanup_on_exit():
    """
    程序退出时清理临时文件
    """
    try:
        print("\n正在清理临时文件...")
        # 遍历所有需要清理的文件模式
        for pattern in TEMP_CLEANUP_PATTERNS:
            file_pattern = os.path.join(TEMP_OUTPUT_DIRECTORY, pattern)
            # 查找匹配的文件
            for file_path in glob.glob(file_pattern):
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception as e:
                    # 静默处理删除失败的文件
                    pass
        print("临时文件清理完成")
    except Exception as e:
        # 静默处理清理过程中的错误
        pass

# 注册退出时的清理函数
atexit.register(cleanup_on_exit)

class DownloadMode:
    txt = "txt"
    epub = "epub"

def run_scrapy_spider(spider_name: str, args: List[str] = []) -> Dict[str, Any]:
    """
    运行Scrapy爬虫并返回结果
    """
    try:
        # 构建命令
        cmd = ["scrapy", "crawl", spider_name] + args
        print(f"执行命令: {' '.join(cmd)}")

        # 执行Scrapy爬虫
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=".", timeout=SPIDER_TIMEOUT)

        if result.returncode != 0:
            raise Exception(f"爬虫执行失败: {result.stderr}")

        return {"success": True, "stdout": result.stdout, "stderr": result.stderr}
    except subprocess.TimeoutExpired:
        raise Exception("爬虫执行超时")
    except Exception as e:
        raise Exception(f"执行爬虫时出错: {str(e)}")

def search_novel(keyword: str) -> List[Dict[str, Any]]:
    """
    搜索小说
    """
    print(f"正在搜索小说: {keyword}...")
    
    # 检查是否已有搜索结果
    search_output_file = get_search_output_file(keyword)
    if os.path.exists(search_output_file):
        with open(search_output_file, "r", encoding="utf-8") as f:
            print(f"找到缓存的搜索结果")
            return json.load(f)
    
    # 执行搜索爬虫
    try:
        run_scrapy_spider("search", ["-a", f"keyword={keyword}"])
        
        if os.path.exists(search_output_file):
            with open(search_output_file, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            print("搜索完成，但未找到结果")
            return []
    except Exception as e:
        print(f"搜索失败: {str(e)}")
        return []

def get_novel_catalog(novel_url: str, book_name: str) -> Optional[Dict[str, Any]]:
    """
    获取小说目录
    """
    print(f"正在获取《{book_name}》的目录...")
    
    # 检查是否已有目录结果
    catalog_file = get_catalog_output_file(book_name)
    if os.path.exists(catalog_file):
        with open(catalog_file, "r", encoding="utf-8") as f:
            print(f"找到缓存的目录结果")
            return json.load(f)
    
    # 执行目录爬虫
    try:
        run_scrapy_spider("catalog", ["-a", f"novel_url={novel_url}", "-a", f"keyword={book_name}"])
        
        if os.path.exists(catalog_file):
            with open(catalog_file, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            print("获取目录完成，但未找到结果")
            return None
    except Exception as e:
        print(f"获取目录失败: {str(e)}")
        return None

def download_novel(task_id: str, novel_url: str, book_name: str, start_chapter: int, end_chapter: int, mode: str) -> None:
    """
    下载小说内容
    """
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
        "-a", f'mode={mode}',
        "-s", pipeline_setting
    ]
    
    try:
        run_scrapy_spider("content", args)
        print(f"《{book_name}》下载完成！")
    except Exception as e:
        print(f"下载失败: {str(e)}")

def show_progress(task_id: str, book_name: str) -> None:
    """
    显示下载进度
    """
    progress_file = os.path.join(TEMP_OUTPUT_DIRECTORY, f"progress_{task_id}.json")
    
    while True:
        if os.path.exists(progress_file):
            try:
                with open(progress_file, "r", encoding="utf-8") as f:
                    progress_data = json.load(f)
                    current = progress_data.get("current", 0)
                    total = progress_data.get("total", 0)
                    percentage = progress_data.get("percentage", 0)
                    
                    sys.stdout.write(f"\r正在下载《{book_name}》: {current}/{total} ({percentage}%)")
                    sys.stdout.flush()
                    
                    if percentage >= 100:
                        break
            except Exception as e:
                pass
        
        time.sleep(2)
    
    sys.stdout.write("\n")

def main():
    """
    主函数，提供命令行交互界面
    """
    print("=" * 50)
    print("欢迎使用小说爬虫命令行工具")
    print("=" * 50)
    
    while True:
        # 1. 搜索小说
        keyword = input("请输入小说名称（或输入'q'退出）: ")
        if keyword.lower() == 'q':
            print("感谢使用，再见！")
            break
        
        search_results = search_novel(keyword)
        if not search_results:
            print("没有找到相关小说，请尝试其他关键词")
            continue
        
        # 2. 显示搜索结果
        print("\n搜索结果：")
        for i, novel in enumerate(search_results):
            print(f"{i+1}. {novel['articlename']} - {novel.get('author', '未知作者')}")
            print(f"   简介: {novel.get('intro', '无简介')[:100]}...")
        
        # 3. 选择小说
        while True:
            try:
                choice = input("\n请选择要下载的小说序号 (1-{}): ".format(len(search_results)))
                if choice.lower() == 'q':
                    print("感谢使用，再见！")
                    return
                novel_idx = int(choice) - 1
                if 0 <= novel_idx < len(search_results):
                    selected_novel = search_results[novel_idx]
                    break
                else:
                    print("请输入有效的序号")
            except ValueError:
                print("请输入有效的数字")
        
        book_name = selected_novel['articlename']
        novel_url = selected_novel['url_list']
        
        # 4. 获取目录
        catalog_data = get_novel_catalog(novel_url, book_name)
        if not catalog_data:
            continue
        
        chapters = catalog_data.get('chapters', [])
        if not chapters:
            print("未找到章节信息")
            continue
        
        print(f"\n《{book_name}》共有 {len(chapters)} 章")
        
        # 5. 选择下载范围
        while True:
            try:
                start_chapter = input("请输入起始章节号 (默认1): ") or "1"
                if start_chapter.lower() == 'q':
                    print("感谢使用，再见！")
                    return
                start_chapter = int(start_chapter)
                
                end_chapter = input("请输入结束章节号 (-1表示全部，默认-1): ") or "-1"
                if end_chapter.lower() == 'q':
                    print("感谢使用，再见！")
                    return
                end_chapter = int(end_chapter)
                
                if end_chapter == -1:
                    end_chapter = len(chapters)
                
                if 1 <= start_chapter <= end_chapter <= len(chapters):
                    break
                else:
                    print(f"请输入有效的章节范围 (1-{len(chapters)})")
            except ValueError:
                print("请输入有效的数字")
        
        # 6. 选择下载格式
        while True:
            mode_input = input("请选择下载格式 (txt/epub，默认txt): ") or "txt"
            if mode_input.lower() == 'q':
                print("感谢使用，再见！")
                return
            if mode_input.lower() in ['txt', 'epub']:
                mode = mode_input.lower()
                break
            else:
                print("请输入有效的格式 (txt或epub)")
        
        # 7. 开始下载
        print(f"\n准备下载《{book_name}》的第{start_chapter}-{end_chapter}章，格式：{mode}")
        confirm = input("确认开始下载？(y/n，默认y): ") or "y"
        
        if confirm.lower() != 'y':
            print("已取消下载")
            continue
        
        # 生成任务ID
        task_id = str(uuid.uuid4())
        
        # 启动下载任务
        download_thread = threading.Thread(
            target=download_novel,
            args=(task_id, novel_url, book_name, start_chapter, end_chapter, mode)
        )
        
        # 启动进度显示线程
        progress_thread = threading.Thread(
            target=show_progress,
            args=(task_id, book_name)
        )
        
        download_thread.start()
        progress_thread.start()
        
        download_thread.join()
        progress_thread.join()
        
        # 显示下载结果
        output_file = get_content_txt_filename(book_name) if mode == DownloadMode.txt else get_content_epub_filename(book_name)
        if os.path.exists(output_file):
            print(f"小说已保存至: {output_file}")
        
        # 是否继续下载其他小说
        continue_input = input("\n是否继续下载其他小说？(y/n，默认y): ") or "y"
        if continue_input.lower() != 'y':
            print("感谢使用，再见！")
            break

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n程序被用户中断")
    except Exception as e:
        print(f"程序运行出错: {str(e)}")