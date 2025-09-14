"""
接口请求模型
"""


from enum import Enum
from pydantic import BaseModel


class SearchRequest(BaseModel):
    keyword: str


class CatalogRequest(BaseModel):
    novel_id: int


class DownloadMode(str, Enum):
    txt = "txt"
    epub = "epub"


class DownloadRequest(BaseModel):
    novel_url: str
    book_name: str = "temp"
    start_chapter: int = 1
    end_chapter: int = -1
    mode: DownloadMode = DownloadMode.txt
