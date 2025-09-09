#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
演示脚本：展示完整的搜索->选择->爬取目录流程
"""
import subprocess
import sys
import os


def run_search_spider(keyword="剑来"):
    """运行搜索爬虫"""
    print(f"开始搜索关键词: {keyword}")
    print("正在搜索中，请稍候...")
    
    try:
        cmd = ["scrapy", "crawl", "search", "-a", f"keyword={keyword}"]
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=".")
        
        if result.returncode == 0:
            print("搜索完成！")
            return True
        else:
            print("搜索失败")
            print("错误信息:", result.stderr)
            return False
    except Exception as e:
        print(f"运行搜索爬虫时出错: {e}")
        return False


def main():
    """主函数"""
    print("小说爬虫演示程序")
    print("="*50)
    
    # 检查是否在正确的目录
    if not os.path.exists("scrapy.cfg"):
        print("请在book_crawler目录下运行此脚本")
        return
    
    # 获取搜索关键词
    keyword = input("请输入要搜索的小说关键词 (默认: 剑来): ").strip()
    print("关键词:", keyword)
    if not keyword:
        keyword = "剑来"
    
    # 运行搜索爬虫
    if not run_search_spider(keyword):
        return
    
    # 运行用户交互界面
    print("\n启动用户交互界面...")
    try:
        # user_interface.main()
        subprocess.run([sys.executable, "user_interface.py"], cwd=".")
    except Exception as e:
        print(f"启动用户界面时出错: {e}")


if __name__ == "__main__":
    main()