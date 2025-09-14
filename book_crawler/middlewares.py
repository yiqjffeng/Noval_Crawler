# Define here the models for your spider middleware
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/spider-middleware.html

from scrapy import signals
from fastapi_app.model import DownloadMode

# useful for handling different item types with a single interface
from itemadapter import ItemAdapter


class BookCrawlerSpiderMiddleware:
    # Not all methods need to be defined. If a method is not defined,
    # scrapy acts as if the spider middleware does not modify the
    # passed objects.

    @classmethod
    def from_crawler(cls, crawler):
        # This method is used by Scrapy to create your spiders.
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_spider_input(self, response, spider):
        # Called for each response that goes through the spider
        # middleware and into the spider.

        # Should return None or raise an exception.
        return None

    def process_spider_output(self, response, result, spider):
        # Called with the results returned from the Spider, after
        # it has processed the response.

        # Must return an iterable of Request, or item objects.
        for i in result:
            yield i

    def process_spider_exception(self, response, exception, spider):
        # Called when a spider or process_spider_input() method
        # (from other spider middleware) raises an exception.

        # Should return either None or an iterable of Request or item objects.
        pass

    async def process_start(self, start):
        # Called with an async iterator over the spider start() method or the
        # maching method of an earlier spider middleware.
        async for item_or_request in start:
            yield item_or_request

    def spider_opened(self, spider):
        spider.logger.info("Spider opened: %s" % spider.name)


import logging
from scrapy import signals

logger = logging.getLogger(__name__)

class PipelineSelectorMiddleware:
    """
    根据爬虫名称和mode参数动态选择pipeline
    """

    @classmethod
    def from_crawler(cls, crawler):
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def spider_opened(self, spider):
        """根据爬虫名称和mode参数设置对应的pipeline"""
        spider_name = spider.name
        
        # # 默认配置
        # pipeline_configs = {}
        #
        # if spider_name == 'search':
        #     pipeline_configs = {
        #         'book_crawler.pipelines.NoOutputPipeline': 300,
        #     }
        #     logger.info(f"Pipeline配置已更新: {spider_name}爬虫使用搜索模式")
        #
        # elif spider_name == 'catalog':
        #     pipeline_configs = {
        #         'book_crawler.pipelines.NoOutputPipeline': 300,
        #     }
        #     logger.info(f"Pipeline配置已更新: {spider_name}爬虫使用目录模式")
        #
        # elif spider_name == 'content':
        #     # 获取mode参数
        #     mode_value = getattr(spider, 'mode', 'txt')
        #     mode_str = str(mode_value).lower()
        #
        #     if 'epub' in mode_str:
        #         pipeline_configs = {
        #             'book_crawler.pipelines.EpubWriterPipeline': 300,
        #         }
        #         logger.info(f"Pipeline配置已更新: {spider_name}爬虫使用epub模式")
        #     else:
        #         pipeline_configs = {
        #             'book_crawler.pipelines.TxtWriterPipeline': 300,
        #         }
        #         logger.info(f"Pipeline配置已更新: {spider_name}爬虫使用txt模式")
        #
        #     logger.info(f"实际mode参数值: {mode_value} -> 转换后: {mode_str}")
        #
        # else:
        #     pipeline_configs = {
        #         'book_crawler.pipelines.NoOutputPipeline': 300,
        #     }
        #     logger.info(f"Pipeline配置已更新: {spider_name}爬虫使用默认模式")
        #
        # # 设置pipeline配置 - 使用正确的方法
        # spider.custom_settings = spider.custom_settings or {}
        # spider.custom_settings['ITEM_PIPELINES'] = pipeline_configs
        #
        # # 打印最终配置
        # logger.info(f"最终ITEM_PIPELINES配置: {pipeline_configs}")


class BookCrawlerDownloaderMiddleware:
    # Not all methods need to be defined. If a method is not defined,
    # scrapy acts as if the downloader middleware does not modify the
    # passed objects.

    @classmethod
    def from_crawler(cls, crawler):
        # This method is used by Scrapy to create your spiders.
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_request(self, request, spider):
        # Called for each request that goes through the downloader
        # middleware.

        # Must either:
        # - return None: continue processing this request
        # - or return a Response object
        # - or return a Request object
        # - or raise IgnoreRequest: process_exception() methods of
        #   installed downloader middleware will be called
        return None

    def process_response(self, request, response, spider):
        # Called with the response returned from the downloader.

        # Must either;
        # - return a Response object
        # - return a Request object
        # - or raise IgnoreRequest
        return response

    def process_exception(self, request, exception, spider):
        # Called when a download handler or a process_request()
        # (from other downloader middleware) raises an exception.

        # Must either:
        # - return None: continue processing this exception
        # - return a Response object: stops process_exception() chain
        # - return a Request object: stops process_exception() chain
        pass

    def spider_opened(self, spider):
        spider.logger.info("Spider opened: %s" % spider.name)
