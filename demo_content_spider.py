#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
演示版本的内容爬虫，使用本地HTML文件展示功能
"""
import json
import os
import re
from typing import Dict, List, Any

import book_crawler.config as config


class DemoContentProcessor:
    """演示内容处理器"""
    
    def __init__(self):
        self.novel_info = {}
        self.chapters = []
        self.completed_chapters = []
    
    def load_catalog(self, catalog_file: str):
        """加载目录文件"""
        with open(catalog_file, 'r', encoding='utf-8') as f:
            catalog_data = json.load(f)
        
        self.novel_info = catalog_data['novel_info']
        self.chapters = catalog_data['chapters']
        
        print(f"加载小说: {self.novel_info['novel_title']}")
        print(f"作者: {self.novel_info['author']}")
        print(f"总章节数: {len(self.chapters)}")
    
    def process_demo_content(self):
        """处理演示内容"""
        # 使用novel_content_example.html作为演示内容
        html_file = "novel_content_example.html"
        if not os.path.exists(html_file):
            print(f"演示HTML文件不存在: {html_file}")
            return
        
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # 模拟解析HTML内容
        title, content = self._extract_content_from_html(html_content)
        
        if content:
            # 为每个章节创建演示内容
            for i, chapter in enumerate(self.chapters[:3]):  # 只处理前3章作为演示
                chapter_data = {
                    'index': i,
                    'title': f"{chapter['title']}",
                    'content': self._create_demo_content(chapter['title'], content),
                    'url': chapter['url']
                }
                self.completed_chapters.append(chapter_data)
                print(f"处理章节 {i+1}: {chapter['title']}")
        
        # 写入文件
        self._write_to_file()
    
    def _extract_content_from_html(self, html_content: str) -> tuple[str, str]:
        """从HTML中提取内容"""
        # 提取标题
        title_match = re.search(r'<h1[^>]*>(.*?)</h1>', html_content, re.DOTALL)
        title = title_match.group(1).strip() if title_match else "演示章节"
        
        # 提取内容
        content_match = re.search(r'<div[^>]*id="chaptercontent"[^>]*>(.*?)</div>', html_content, re.DOTALL)
        if content_match:
            raw_content = content_match.group(1)
            # 清理HTML标签
            content = re.sub(r'<[^>]+>', '', raw_content)
            content = re.sub(r'&nbsp;', ' ', content)
            content = re.sub(r'&lt;', '<', content)
            content = re.sub(r'&gt;', '>', content)
            content = re.sub(r'&amp;', '&', content)
            
            # 清理多余的空白
            content = re.sub(r'\s+', ' ', content).strip()
            
            return title, content
        
        return title, ""
    
    def _create_demo_content(self, chapter_title: str, base_content: str) -> str:
        """创建演示内容"""
        # 分段处理
        sentences = base_content.split('。')
        paragraphs = []
        
        current_paragraph = ""
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence:
                current_paragraph += sentence + "。"
                # 每3-4句话分一段
                if len(current_paragraph) > 150:
                    if current_paragraph:
                        # 添加段首缩进
                        paragraphs.append(config.PARAGRAPH_INDENT + current_paragraph)
                        current_paragraph = ""
        
        # 添加最后一段
        if current_paragraph:
            paragraphs.append(config.PARAGRAPH_INDENT + current_paragraph)
        
        return '\n\n'.join(paragraphs)
    
    def _write_to_file(self):
        """写入文件"""
        # 确保输出目录存在
        os.makedirs(config.OUTPUT_DIRECTORY, exist_ok=True)
        
        with open(config.CONTENT_OUTPUT_FILE, 'w', encoding='utf-8') as f:
            # 写入小说信息
            f.write(f"{self.novel_info['novel_title']}\n")
            f.write(f"作者: {self.novel_info.get('author', '未知')}\n")
            f.write(f"总章节数: {self.novel_info['total_chapters']}\n")
            f.write(f"来源: {self.novel_info['detail_url']}\n")
            f.write("=" * 50 + "\n\n")
            
            # 写入章节内容
            for i, chapter_data in enumerate(self.completed_chapters):
                # 写入章节标题
                f.write(f"{chapter_data['title']}\n\n")
                
                # 写入章节内容
                f.write(chapter_data['content'])
                
                # 写入章节分隔符（除了最后一章）
                if i < len(self.completed_chapters) - 1:
                    f.write(config.CHAPTER_SEPARATOR)
        
        print(f"\n演示内容已保存到: {config.CONTENT_OUTPUT_FILE}")
        print(f"成功写入 {len(self.completed_chapters)} 个演示章节")
        
        # 显示文件信息
        file_size = os.path.getsize(config.CONTENT_OUTPUT_FILE)
        print(f"文件大小: {file_size / 1024:.2f} KB")


def main():
    """主函数"""
    print("📚 小说内容爬虫演示程序")
    print("=" * 50)
    
    processor = DemoContentProcessor()
    
    # 使用测试目录文件
    catalog_file = "output/test_catalog.json"
    if not os.path.exists(catalog_file):
        print(f"目录文件不存在: {catalog_file}")
        print("请先运行: scrapy crawl catalog")
        return
    
    try:
        processor.load_catalog(catalog_file)
        processor.process_demo_content()
        
        print("\n✅ 演示完成！")
        print(f"📖 查看生成的内容文件: {config.CONTENT_OUTPUT_FILE}")
        
    except Exception as e:
        print(f"❌ 演示过程中出错: {e}")


if __name__ == "__main__":
    main()