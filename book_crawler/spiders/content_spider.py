import scrapy
from ..config import (
    SUPPORTED_DOMAINS,
)

class ContentSpider(scrapy.Spider):
    name = "content"
    allowed_domains = SUPPORTED_DOMAINS
    
    def __init__(self, catalog_file=None, **kwargs):
        super().__init__(**kwargs)