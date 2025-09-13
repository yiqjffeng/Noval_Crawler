# -*- coding: utf-8 -*-
import json
import os
from json import JSONDecodeError

import scrapy

from ..config import (
    SUPPORTED_DOMAINS,
    PARAGRAPH_INDENT,
    INVALID_CHAPTER_KEYWORDS,
    REQUEST_HEADERS,
    TEMP_OUTPUT_DIRECTORY,
    get_catalog_output_file,
)
from ..items import ContentItem


def clean_content(text: str) -> str:
    """清洗章节内容"""
    if not text:  # 防止 None
        return ""

    lines = [line.strip() for line in text.splitlines()]
    valid_lines = []
    for line in lines:
        if not line:
            continue
        if any(kw in line for kw in INVALID_CHAPTER_KEYWORDS):
            continue
        valid_lines.append(PARAGRAPH_INDENT + line)
    return "\n".join(valid_lines)


class ContentSpider(scrapy.Spider):
    name = "content"
    allowed_domains = SUPPORTED_DOMAINS.copy()

    def __init__(self, start_idx=0, end_idx=-1, task_id=None, keyword : str = None, book_name: str = None, **kwargs):
        super().__init__(**kwargs)
        self.failed_chapters = []
        self.catalog = {}
        self.keyword = keyword
        self.book_name = book_name or keyword
        self.start_idx = (int(start_idx) if start_idx else 1) - 1
        self.end_idx = int(end_idx) if end_idx and end_idx != '-1' else -1
        self.task_id = task_id or "default"
        self.total_chapters = 0
        self.downloaded_chapters = 0

        # 进度文件路径
        self.progress_file = f"{TEMP_OUTPUT_DIRECTORY}/progress_{self.task_id}.json"

        catalog_output_file = get_catalog_output_file(self.keyword)

        if os.path.exists(catalog_output_file):
            try:
                with open(catalog_output_file, "r", encoding="utf-8") as f:
                    self.catalog = json.load(f)
            except JSONDecodeError as e:
                self.logger.error(f"catalog读取时出错，该文件不是json文件: {str(e)}")
        else:
            self.logger.error(f"未找到目录文件: {catalog_output_file}")
            self.logger.error("请先运行目录爬虫")

        # 创建进度文件
        self._update_progress(0, 0, "starting")

    def start_requests(self):
        if not self.catalog:
            return

        chapters = self.catalog.get("chapters", [])

        # 计算实际的章节范围
        start = max(0, self.start_idx - 1)  # 转换为0-based索引
        end = len(chapters) if self.end_idx == -1 else min(self.end_idx, len(chapters))

        target_chapters = chapters[start:end]
        self.total_chapters = len(target_chapters)

        # 更新进度
        self._update_progress(0, self.total_chapters, "downloading")

        for idx, chapter in enumerate(target_chapters):
            url_path = chapter.get("url", "")
            if not url_path.startswith("/book/"):
                continue

            # 轮流使用 allowed_domains 里的域名
            domain = self.allowed_domains[idx % len(self.allowed_domains)]
            full_url = f"https://www.{domain}{url_path}"

            yield scrapy.Request(
                full_url,
                headers=REQUEST_HEADERS,
                callback=self.parse,
                meta={"chapter": chapter, "chapter_index": idx + 1},
                dont_filter=True,
            )

    def parse(self, response):
        chapter = response.meta["chapter"]
        chapter_index = response.meta["chapter_index"]
        novel_info = self.catalog.get("novel_info", {})

        item = ContentItem()
        item["novel_id"] = novel_info.get("novel_id")
        item["novel_title"] = novel_info.get("novel_title")
        item["chapter_title"] = (
            response.css("h1::text").get(default=chapter.get("title", "")).strip()
        )
        item["detail_url"] = response.url
        item["domain"] = response.url.split("/")[2]
        item['book_name'] = self.book_name

        # 提取正文
        raw_texts = response.xpath('//*[@id="chaptercontent"]//text()').getall()
        raw_text = "\n".join(raw_texts).strip() if raw_texts else ""

        item["content"] = clean_content(raw_text)

        if not item["content"]:
            self.logger.warning(f"章节内容为空: {response.url}")
            self.failed_chapters.append(response.url)

        # 更新进度
        self.downloaded_chapters += 1
        self._update_progress(
            self.downloaded_chapters,
            self.total_chapters,
            "downloading"
        )

        yield item

    def closed(self, reason):
        """爬虫关闭时的回调"""
        if reason == "finished":
            self._update_progress(self.downloaded_chapters, self.total_chapters, "completed")
        else:
            self._update_progress(self.downloaded_chapters, self.total_chapters, "failed")

    def _update_progress(self, current, total, status):
        """更新进度到文件"""
        try:
            # 移除自动创建output目录逻辑
            # os.makedirs("output", exist_ok=True)
            progress_data = {
                "task_id": self.task_id,
                "current": current,
                "total": total,
                "percentage": int((current / total * 100)) if total > 0 else 0,
                "status": status,
                "failed_chapters": self.failed_chapters
            }
            with open(self.progress_file, "w", encoding="utf-8") as f:
                json.dump(progress_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            self.logger.error(f"更新进度文件失败: {e}")
