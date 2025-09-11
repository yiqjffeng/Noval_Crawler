import scrapy
import json
import os
from typing import Any, Optional

import book_crawler.config as config
from book_crawler.items import ChapterItem


class CatalogSpider(scrapy.Spider):
    name: str = "catalog"
    allowed_domains: list[str] = config.SUPPORTED_DOMAINS
    handle_httpstatus_list: list[int] = [302]  # 处理重定向状态码
    novel_url: Optional[str]

    def __init__(self, novel_url: Optional[str] = None, keyword : Optional[str] = config.KEYWORD, **kwargs: Any):
        super().__init__(**kwargs)
        self.novel_url = novel_url
        self.keyword = keyword
        self.logger.info(f"初始化目录爬虫，小说URL: {self.novel_url}")


    def start_requests(self):
        """开始请求，使用传入的URL"""
        if not self.novel_url:
            self.logger.error("未提供小说URL，爬虫结束")
            return
        
        # 构建完整URL
        if self.novel_url.startswith('/'):
            full_url = f"https://www.{config.CURRENT_DOMAIN}{self.novel_url}"
        else:
            full_url = self.novel_url
            
        self.logger.info(f"开始爬取小说目录: {full_url}")
        
        yield scrapy.Request(
            url=full_url,
            callback=self.parse_catalog,
            headers=config.REQUEST_HEADERS,
            meta={'novel_url': self.novel_url}
        )
    
    def parse_catalog(self, response):
        """解析小说目录页面"""
        try:
            # 提取小说基本信息
            novel_title = response.css(config.CSS_SELECTORS['title']).get()
            if not novel_title:
                novel_title = response.css(config.CSS_SELECTORS['title_fallback']).get()
            
            # 提取作者信息
            author_spans = response.css(config.CSS_SELECTORS['author_spans']).getall()
            author = None
            for span_text in author_spans:
                if '作者：' in span_text:
                    author = span_text.replace('作者：', '').strip()
                    break
            
            # 提取章节列表
            chapter_links = response.css(config.CSS_SELECTORS['chapter_links'])
            chapters = []
            
            for link in chapter_links:
                chapter_title = link.css(config.CSS_SELECTORS['chapter_title']).get()
                chapter_url = link.css(config.CSS_SELECTORS['chapter_url']).get()
                
                if chapter_title and chapter_url:
                    # 构建完整的章节URL
                    chapters.append({
                        'title': chapter_title.strip(),
                        'url': chapter_url.strip(),
                    })
            
            # 过滤掉非章节链接
            filtered_chapters = []
            for chapter in chapters:
                title = chapter['title']
                if self._is_valid_chapter(title):
                    filtered_chapters.append(chapter)
            
            total_chapters = len(filtered_chapters)
            
            # 获取域名
            domain = response.url.split('/')[2]
            
            # 创建ChapterItem
            chapter_item = ChapterItem()
            chapter_item['novel_id'] = response.meta.get('novel_url', response.url)
            chapter_item['novel_title'] = novel_title or "未知标题"
            chapter_item['total_chapters'] = total_chapters
            chapter_item['domain'] = domain
            chapter_item['detail_url'] = response.url
            
            self.logger.info(f"成功解析小说: {novel_title}")
            self.logger.info(f"总章节数: {total_chapters}")
            self.logger.info(f"使用域名: {domain}")
            
            # 保存章节信息到文件
            output_data = {
                'novel_info': {
                    'novel_id': chapter_item['novel_id'],
                    'novel_title': chapter_item['novel_title'],
                    'author': author,
                    'total_chapters': chapter_item['total_chapters'],
                    'domain': chapter_item['domain'],
                    'detail_url': chapter_item['detail_url']
                },
                'chapters': filtered_chapters
            }
            
            # 使用配置中的输出文件路径
            catalog_output_file = config.get_catalog_output_file(self.keyword)
            self.logger.info(f"保存数据到 {catalog_output_file}")
            with open(catalog_output_file, "w", encoding="utf-8") as f:
                json.dump(output_data, f, ensure_ascii=False, indent=4)
            
            self.logger.info(f"章节信息已保存到: {catalog_output_file}")
            
            yield chapter_item
            
        except Exception as e:
            self.logger.error(f"解析目录页面时出错: {str(e)}", exc_info=True)
    
    def _is_valid_chapter(self, title: str) -> bool:
        """
        判断是否为有效章节标题
        使用配置文件中的过滤规则，避免误过滤正常章节
        """
        if not title or not title.strip():
            return False
        
        title = title.strip()
        
        # 检查完全匹配的无效关键词
        if title in config.INVALID_CHAPTER_KEYWORDS:
            return False
        
        # 检查开头匹配的模式
        if any(title.startswith(prefix) for prefix in config.INVALID_CHAPTER_PREFIXES):
            return False
        
        # 过滤纯符号或过短的标题
        if len(title) <= 2 and not title.replace('-', '').replace('=', '').replace('*', ''):
            return False
        
        # 过滤明显的导航元素（完全匹配）
        if title in config.NAVIGATION_KEYWORDS:
            return False
        
        # 过滤只包含特殊字符的标题
        special_char_only = all(c in '=-*~`!@#$%^&()[]{}|\\:";\'<>?,./' for c in title)
        if special_char_only:
            return False
        
        return True
