import json
import os
import random
from urllib.parse import quote
import scrapy

import book_crawler.config as config   # ✅ 引入整个 config 模块


class SearchSpider(scrapy.Spider):
    name = "search"
    allowed_domains = config.SUPPORTED_DOMAINS

    def __init__(self, keyword=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.keyword = keyword if keyword else config.DEFAULT_KEYWORD
        config.KEYWORD = self.keyword

        # 当前域名索引
        self.current_domain_index = config.SUPPORTED_DOMAINS.index(config.DEFAULT_DOMAIN)
        self.current_domain = config.DEFAULT_DOMAIN
        config.CURRENT_DOMAIN = self.current_domain   # ✅ 初始化时同步

        # 重试控制
        self.retry_count = 0
        self.total_attempts = 0

        self.logger.info(f"初始化爬虫，搜索关键词: {self.keyword}, 使用域名: {self.current_domain}")

    def __get_cookie(self):
        """模拟 GetCookies.js """
        # domains = [
        #     "750f287d3.cfd", "b9afb.lol", "dceba62fe.sbs",
        #     "0d6f590b.sbs", "099990886b.cfd"
        # ]
        return {
            # "getsite": random.choice(domains),
            "hm": "3591fbe5eb25068174dcd6e2df840b6c",
            # "hmt": "1757069195",
        }

    def start_requests(self):
        yield self.make_request()

    def make_request(self):
        """构造请求"""
        encoded_keyword = quote(self.keyword)
        search_api_url = f"https://www.{self.current_domain}/user/search.html?q={encoded_keyword}&so=undefined"

        headers = config.REQUEST_HEADERS.copy()
        headers["referer"] = f"https://www.{self.current_domain}/s?q={encoded_keyword}"

        cookies = self.__get_cookie()

        self.logger.info(
            f"尝试请求: {search_api_url} "
            f"(第 {self.total_attempts+1} 次尝试, 当前域名: {self.current_domain})"
        )
        return scrapy.Request(
            url=search_api_url,
            callback=self.parse_api,
            headers=headers,
            cookies=cookies,
            meta={"keyword": self.keyword, "domain": self.current_domain},
            errback=self.parse_failure,
        )

    def parse_failure(self, failure):
        """请求失败时处理"""
        self.retry_count += 1
        self.total_attempts += 1
        current_domain = failure.request.meta.get("domain")

        self.logger.error(
            f"请求失败: {failure.getErrorMessage()}, 域名: {current_domain}, 当前域名重试次数: {self.retry_count}"
        )

        if self.total_attempts >= config.MAX_TOTAL_ATTEMPTS:
            self.logger.error("所有域名均尝试失败，爬虫结束")
            return

        if self.retry_count < config.MAX_RETRY_TIMES:
            self.logger.info(f"继续重试当前域名: {self.current_domain}")
            yield self.make_request()
        else:
            # 切换域名
            self.retry_count = 0
            self.current_domain_index = (self.current_domain_index + 1) % len(config.SUPPORTED_DOMAINS)
            self.current_domain = config.SUPPORTED_DOMAINS[self.current_domain_index]
            config.CURRENT_DOMAIN = self.current_domain  # ✅ 更新 config 里的值
            self.logger.info(f"切换到备用域名: {self.current_domain}")
            yield self.make_request()

    def parse_api(self, response):
        """解析 API 返回的 JSON"""

        # 确保输出目录存在
        os.makedirs(config.OUTPUT_DIRECTORY, exist_ok=True)
        try:
            self.logger.info(f"成功解析 API 返回的 JSON: {response.url}")
            self.logger.info(f"保存数据到 {config.OUTPUT_FILE}")

            data = response.json()
            self.logger.info(f"共抓取了 {len(data)} 条数据")

            # 写入 JSON 文件（格式化）
            with open(config.OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)

        except json.JSONDecodeError as e:
            self.logger.error(f"JSON 解析失败: {str(e)}")
            with open(config.ERROR_LOG_FILE, "wb") as f:
                f.write(response.body)
            self.logger.info(f"错误响应已保存到 {config.ERROR_LOG_FILE}")
        except Exception as e:
            self.logger.error(f"处理响应时出错: {str(e)}", exc_info=True)
            with open(config.ERROR_LOG_FILE, "wb") as f:
                f.write(response.body)
