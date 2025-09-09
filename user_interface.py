#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
用户交互界面，用于选择要爬取的小说
"""
import json
import os
import subprocess
import sys

# 导入配置
import book_crawler.config as config


def load_search_results():
    """加载搜索结果"""
    if not os.path.exists(config.OUTPUT_FILE):
        print(f"搜索结果文件不存在: {config.OUTPUT_FILE}")
        print("请先运行搜索爬虫: scrapy crawl search -a keyword=你的关键词")
        return None
    
    try:
        with open(config.OUTPUT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"读取搜索结果失败: {e}")
        return None


def display_search_results(results):
    """显示搜索结果供用户选择"""
    print("\n" + "="*80)
    print("搜索结果列表")
    print("="*80)
    
    for i, book in enumerate(results, 1):
        print(f"\n{i}. {book['articlename']}")
        print(f"   作者: {book['author']}")
        print(f"   简介: {book['intro'][:100]}{'...' if len(book['intro']) > 100 else ''}")
        print(f"   链接: {book['url_list']}")
    
    print("\n" + "="*80)


def get_user_choice(results):
    """获取用户选择"""
    while True:
        try:
            choice = input(f"\n请选择要爬取的小说 (1-{len(results)}, 输入 q 退出): ").strip()
            
            if choice.lower() == 'q':
                print("退出程序")
                return None
            
            choice_num = int(choice)
            if 1 <= choice_num <= len(results):
                return results[choice_num - 1]
            else:
                print(f"请输入 1-{len(results)} 之间的数字")
        except ValueError:
            print("请输入有效的数字")


def run_catalog_crawler(novel_url):
    """运行目录爬虫"""
    print(f"\n开始爬取小说目录: {novel_url}")
    print("正在爬取中，请稍候...")
    
    try:
        # 运行catalog爬虫
        cmd = ["scrapy", "crawl", "catalog", "-a", f"novel_url={novel_url}"]
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=".")
        
        if result.returncode == 0:
            print("目录爬取完成！")
            
            # 检查输出文件
            if os.path.exists(config.CATALOG_OUTPUT_FILE):
                with open(config.CATALOG_OUTPUT_FILE, 'r', encoding='utf-8') as f:
                    catalog_data = json.load(f)
                
                novel_info = catalog_data['novel_info']
                chapters = catalog_data['chapters']
                
                print(f"\n爬取结果:")
                print(f"   小说名称: {novel_info['novel_title']}")
                print(f"   作者: {novel_info.get('author', '未知')}")
                print(f"   总章节数: {novel_info['total_chapters']}")
                print(f"   使用域名: {novel_info['domain']}")
                print(f"   数据已保存到: {config.CATALOG_OUTPUT_FILE}")
                
                # 显示前几个章节作为示例
                print(f"\n章节列表预览 (前5章):")
                for i, chapter in enumerate(chapters[:5], 1):
                    print(f"   {i}. {chapter['title']}")
                
                if len(chapters) > 5:
                    print(f"   ... 还有 {len(chapters) - 5} 章")
                
                # 询问是否继续爬取内容
                print(f"\n是否继续爬取小说内容? (y/n): ", end="")
                content_choice = input().strip().lower()
                if content_choice == 'y':
                    run_content_crawler()
                    
            else:
                print("目录文件未生成，可能爬取过程中出现问题")
        else:
            print("目录爬取失败")
            print("错误信息:", result.stderr)
            
    except Exception as e:
        print(f"运行爬虫时出错: {e}")


def run_content_crawler():
    """运行内容爬虫"""
    print(f"\n开始爬取小说内容...")
    print("正在爬取中，请稍候...")
    print("注意: 内容爬取可能需要较长时间，请耐心等待")
    
    try:
        # 运行content爬虫
        cmd = ["scrapy", "crawl", "content"]
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=".")
        
        if result.returncode == 0:
            print("内容爬取完成！")
            
            # 检查输出文件
            if os.path.exists(config.CONTENT_OUTPUT_TXT_FILE):
                # 获取文件大小
                file_size = os.path.getsize(config.CONTENT_OUTPUT_TXT_FILE)
                file_size_mb = file_size / (1024 * 1024)
                
                print(f"\n爬取结果:")
                print(f"   内容文件: {config.CONTENT_OUTPUT_TXT_FILE}")
                print(f"   文件大小: {file_size_mb:.2f} MB")
                
                # 读取文件前几行显示预览
                try:
                    with open(config.CONTENT_OUTPUT_TXT_FILE, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        print(f"   总行数: {len(lines)}")
                        
                        print(f"\n文件预览 (前10行):")
                        for i, line in enumerate(lines[:10], 1):
                            print(f"   {i:2d}. {line.rstrip()}")
                        
                        if len(lines) > 10:
                            print(f"   ... 还有 {len(lines) - 10} 行")
                            
                except Exception as e:
                    print(f"   读取文件预览失败: {e}")
                    
            else:
                print("内容文件未生成，可能爬取过程中出现问题")
        else:
            print("内容爬取失败")
            print("错误信息:", result.stderr)
            
    except Exception as e:
        print(f"运行内容爬虫时出错: {e}")


def main():
    """主函数"""
    print("小说目录爬取工具")
    print("="*50)
    
    # 加载搜索结果
    results = load_search_results()
    if not results:
        return
    
    # 显示搜索结果
    display_search_results(results)
    
    # 获取用户选择
    selected_book = get_user_choice(results)
    if not selected_book:
        return
    
    # 显示选择的小说信息
    print(f"\n您选择了: 《{selected_book['articlename']}》")
    print(f"   作者: {selected_book['author']}")
    print(f"   URL: {selected_book['url_list']}")
    
    # 确认是否继续
    confirm = input("\n是否开始爬取该小说的目录? (y/n): ").strip().lower()
    if confirm != 'y':
        print("取消操作")
        return
    
    # 运行目录爬虫
    run_catalog_crawler(selected_book['url_list'])


if __name__ == "__main__":
    main()