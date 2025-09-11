# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter


class BookCrawlerPipeline:
    def process_item(self, item, spider):
        return item

from concurrent.futures import ThreadPoolExecutor, as_completed
from scrapy.utils.project import get_project_settings
from config import get_content_txt_filename
from book_crawler.config import KEYWORD

class TxtWriterPipeline:
    def open_spider(self, spider):
        settings = get_project_settings()
        self.executor = ThreadPoolExecutor(max_workers=settings.getint("WRITE_CONCURRENCY"))
        self.tasks = []
        self.output_file = open(get_content_txt_filename(KEYWORD), "w", encoding="utf-8")

    def process_item(self, item, spider):
        spider.logger.info(f"写入章节: {item['chapter_title']} 内容长度={len(item.get('content', ''))}")
        future = self.executor.submit(self.write_item, item)
        self.tasks.append(future)
        return item

    def write_item(self, item):
        # 写入逻辑（章节格式化）
        formatted = f"  {item['chapter_title']}\n\n{item['content']}\n\n--------\n\n"
        self.output_file.write(formatted)

    def close_spider(self, spider):
        for task in as_completed(self.tasks):
            task.result()  # 确保所有任务完成
        self.output_file.close()
        self.executor.shutdown()


