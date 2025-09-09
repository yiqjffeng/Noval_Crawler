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
            f"(第 {self.total_attempts + 1} 次尝试, 当前域名: {self.current_domain})"
        )
        return scrapy.Request(
            url=search_api_url,
            callback=self.parse_api,
            headers=headers,
            cookies=cookies,
            meta={"keyword": self.keyword, "domain": self.current_domain},
            errback=self.parse_failure,
            dont_filter=True,
        )

    def _make_failure(self, response, reason="Unknown"):
        """构造一个 fake failure 对象"""
        return type(
            "FakeFailure", (), {"request": response.request, "value": reason}
        )()

    def parse_failure(self, failure):
        """请求失败时处理（包括网络错误和逻辑错误）"""
        self.retry_count += 1
        self.total_attempts += 1
        current_domain = (
            failure.request.meta.get("domain") if hasattr(failure, "request") else self.current_domain
        )

        self.logger.error(
            f"请求失败: {getattr(failure, 'value', failure)}, "
            f"域名: {current_domain}, 当前域名重试次数: {self.retry_count}"
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

        body = response.text.strip()
        # 1. 判断特殊空结果
        if body == "1":
            self.logger.warning(f"接口返回 1（空结果），域名: {self.current_domain}")
            yield from self.parse_failure(self._make_failure(response, "Empty search result"))
            return

        # 2. 尝试解析 JSON
        try:
            data = response.json()
        except Exception as e:
            self.logger.error(f"JSON 解析失败: {e}")
            yield from self.parse_failure(self._make_failure(response, "Invalid JSON"))
            return

        # 3. 判空 JSON
        if isinstance(data, (list, dict)) and not data:
            self.logger.warning(f"接口返回空 JSON，域名: {self.current_domain}")
            yield from self.parse_failure(self._make_failure(response, "Empty JSON"))
            return

        # 4. 成功时写入
        try:
            os.makedirs(config.OUTPUT_DIRECTORY, exist_ok=True)
            with open(config.OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)

            self.logger.info(f"成功保存搜索结果到 {config.OUTPUT_FILE}")
            self.retry_count = 0  # ✅ 重置当前域名重试次数

        except Exception as e:
            self.logger.error(f"保存 JSON 时出错: {e}", exc_info=True)
            yield from self.parse_failure(self._make_failure(response, "Save error"))
