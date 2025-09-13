import hashlib
import time
import random
from typing import List,Dict

import requests


def generate_hm_cookie() -> str:
    """
    模拟生成类似 hm=3c84707a53fc1c688539e6ffcd1e5423 的 Cookie
    使用 MD5(时间 + 随机数 + salt) 生成
    """
    # 模拟生成唯一标识
    input_str = f"{time.time()}{random.random()}secret_salt"
    md5 = hashlib.md5()
    md5.update(input_str.encode('utf-8'))
    return md5.hexdigest()


def get_cookies(domain : str, keyword : str) -> Dict[str, str]:
    """
    生成模拟的cookies
    """
    from book_crawler.config import REQUEST_HEADERS
    from urllib.parse import quote
    return {
        'hm': (requests.get(
            f'https://www.{domain}/user/hm.html?q={quote(keyword)}',
            headers=REQUEST_HEADERS,
            cookies={'hm': generate_hm_cookie()}
        ).cookies
               .values()[0])
    }


def get_supported_domains() -> List[str]:
    """
    安全地获取所有支持的域名列表

    返回:
        List[str]: 域名列表
    """

    import requests
    import re
    import json

    url = 'https://www.bqg128.com/js/compc.js'

    try:
        # 添加请求头，模拟浏览器行为
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # 发送请求并验证响应
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # 如果请求失败则抛出异常

        text = response.text

        # 使用更精确的正则表达式匹配
        pattern = re.compile(r'var\s+array\s*=\s*(\[.*?\]);', re.DOTALL)
        match = pattern.search(text)

        if not match:
            raise ValueError("未找到数组定义")

        # 提取数组字符串
        array_str = match.group(1)

        # 使用json.loads安全解析，而不是eval
        # 首先将单引号转换为双引号以符合JSON格式
        json_str = array_str.replace("'", '"')

        # 解析JSON
        domain_list = json.loads(json_str)

        # 验证结果是否为列表
        if not isinstance(domain_list, list):
            raise ValueError("解析结果不是列表")

        # 验证列表中的每个元素都是字符串
        for domain in domain_list:
            if not isinstance(domain, str):
                raise ValueError(f"域名不是字符串: {domain}")

        return domain_list

    except requests.exceptions.RequestException as e:
        print(f"网络请求错误: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        # 尝试使用ast.literal_eval作为备选方案
        try:
            import ast
            domain_list = ast.literal_eval(array_str)
            if isinstance(domain_list, list):
                return domain_list
            else:
                raise ValueError("解析结果不是列表")
        except (ImportError, ValueError, SyntaxError) as ast_e:
            print(f"AST解析也失败: {ast_e}")
            return []
    except Exception as e:
        print(f"未知错误: {e}")
        return []