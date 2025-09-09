# -*- coding: utf-8 -*-
import json
import os
from json import JSONDecodeError

import scrapy

from ..config import (
    SUPPORTED_DOMAINS,
    CATALOG_OUTPUT_FILE,
    PARAGRAPH_INDENT,
    INVALID_CHAPTER_KEYWORDS,
    REQUEST_HEADERS,
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

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.failed_chapters = []
        self.catalog = {}

        if os.path.exists(CATALOG_OUTPUT_FILE):
            try:
                with open(CATALOG_OUTPUT_FILE, "r", encoding="utf-8") as f:
                    self.catalog = json.load(f)
            except JSONDecodeError as e:
                self.logger.error(f"catalog读取时出错，该文件不是json文件: {str(e)}")
        else:
            self.logger.error(f"未找到目录文件: {CATALOG_OUTPUT_FILE}")
            self.logger.error("请先运行目录爬虫")

    def start_requests(self):
        if not self.catalog:
            return

        chapters = self.catalog.get("chapters", [])
        for idx, chapter in enumerate(chapters):
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
                meta={"chapter": chapter},
                dont_filter=True,
            )

    def parse(self, response):
        chapter = response.meta["chapter"]
        novel_info = self.catalog.get("novel_info", {})

        item = ContentItem()
        item["novel_id"] = novel_info.get("novel_id")
        item["novel_title"] = novel_info.get("novel_title")
        item["chapter_title"] = (
            response.css("h1::text").get(default=chapter.get("title", "")).strip()
        )
        item["detail_url"] = response.url
        item["domain"] = response.url.split("/")[2]

        # 提取正文
        raw_texts = response.xpath('//*[@id="chaptercontent"]//text()').getall()
        raw_text = "\n".join(raw_texts).strip() if raw_texts else ""

        item["content"] = clean_content(raw_text)
        # self.logger.info(f'正在处理章节: {item["chapter_title"]}\n内容为：\n{item["content"]}')

        if not item["content"]:
            self.logger.warning(f"章节内容为空: {response.url}")
            self.failed_chapters.append(response.url)

        yield item
