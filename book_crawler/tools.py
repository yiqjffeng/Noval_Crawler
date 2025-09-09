import hashlib
import time
import random
import requests


def generate_hm_cookie():
    """
    模拟生成类似 hm=3c84707a53fc1c688539e6ffcd1e5423 的 Cookie
    使用 MD5(时间 + 随机数 + salt) 生成
    """
    # 模拟生成唯一标识
    input_str = f"{time.time()}{random.random()}secret_salt"
    md5 = hashlib.md5()
    md5.update(input_str.encode('utf-8'))
    return md5.hexdigest()


def get_cookies():
    """
    生成模拟的cookies
    """
    from book_crawler.config import CURRENT_DOMAIN, KEYWORD, REQUEST_HEADERS
    from urllib.parse import quote
    return {
        'hm': (requests.get(
            f'https://www.{CURRENT_DOMAIN}/user/hm.html?q={quote(KEYWORD)}',
            headers=REQUEST_HEADERS,
            cookies={'hm': generate_hm_cookie()}
        ).cookies
               .values()[0])
    }
