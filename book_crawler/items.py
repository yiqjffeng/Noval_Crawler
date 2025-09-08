# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class BookCrawlerItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    pass


import scrapy


class SearchResultItem(scrapy.Item):
    title = scrapy.Field()  # 小说标题
    author = scrapy.Field()  # 作者
    cover_image = scrapy.Field()  # 封面图片URL
    description = scrapy.Field()  # 简介
    detail_url = scrapy.Field()  # 详情页链接


class ChapterItem(scrapy.Item):
    novel_id = scrapy.Field()  # 小说ID
    novel_title = scrapy.Field()  # 小说标题
    total_chapters = scrapy.Field()  # 章节总数
    domain = scrapy.Field()  # 使用的域名
    detail_url = scrapy.Field()  # 详情页链接


class ContentItem(scrapy.Item):
    novel_id = scrapy.Field()  # 小说ID
    novel_title = scrapy.Field()  # 小说标题
    chapter_title = scrapy.Field()  # 章节标题
    content = scrapy.Field()  # 章节内容
    domain = scrapy.Field()  # 使用的域名
    detail_url = scrapy.Field()  # 详情页链接