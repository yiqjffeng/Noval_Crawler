# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html
import os

# useful for handling different item types with a single interface
from itemadapter import ItemAdapter


class BookCrawlerPipeline:
    def process_item(self, item, spider):
        return item

from concurrent.futures import ThreadPoolExecutor, as_completed
from scrapy.utils.project import get_project_settings
from config import get_content_txt_filename, get_content_epub_filename
try:
    from ebooklib import epub
except ImportError:
    print("警告: 未找到 ebooklib 库，无法生成 EPUB 格式文件")
    epub = None

class TxtWriterPipeline:
    """仅用于content爬虫的TXT文件写入pipeline"""
    def open_spider(self, spider):
        # 只有content爬虫才使用这个pipeline
        if spider.name != 'content':
            return
            
        settings = get_project_settings()
        self.executor = ThreadPoolExecutor(max_workers=settings.getint("WRITE_CONCURRENCY"))
        self.tasks = []
        self.book_name = getattr(spider, 'book_name', '未知书名')
        self.output_file_name = get_content_txt_filename(self.book_name)
        os.makedirs(os.path.dirname(self.output_file_name), exist_ok=True)
        self.output_file = open(self.output_file_name, "w", encoding="utf-8")

    def process_item(self, item, spider):
        if spider.name != 'content':
            return item
            
        spider.logger.info(f"写入章节: {item['chapter_title']} 内容长度={len(item.get('content', ''))}")
        future = self.executor.submit(self.write_item, item)
        self.tasks.append(future)
        return item

    def write_item(self, item):
        # 写入逻辑（章节格式化）
        formatted = f"  {item['chapter_title']}\n\n{item['content']}\n\n--------\n\n"
        self.output_file.write(formatted)

    def close_spider(self, spider):
        if spider.name != 'content':
            return
            
        for task in as_completed(self.tasks):
            task.result()  # 确保所有任务完成
        self.output_file.close()
        self.executor.shutdown()


class NoOutputPipeline:
    """用于search和catalog爬虫的空pipeline，不创建任何输出文件"""
    def process_item(self, item, spider):
        return item


class EpubWriterPipeline:
    """用于content爬虫的EPUB文件写入pipeline"""
    
    def open_spider(self, spider):
        # 只有content爬虫且模式为epub才使用这个pipeline
        if spider.name != 'content':
            return
            
        self.mode = getattr(spider, 'mode', 'txt')
        if self.mode != 'epub':
            return
            
        if epub is None:
            spider.logger.error("EPUB支持不可用，请安装 ebooklib: pip install ebooklib")
            return
            
        self.book_name = getattr(spider, 'book_name', '未知书名')
        self.author = getattr(spider, 'author', '未知作者')
        
        # 初始化EPUB书籍
        self.book = epub.EpubBook()
        self.book.set_identifier('id123456')
        self.book.set_title(self.book_name)
        self.book.set_language('zh')
        self.book.add_author(self.author)
        
        # 存储章节
        self.chapters = []
        self.spine = ['nav']
        
    def process_item(self, item, spider):
        if spider.name != 'content' or getattr(spider, 'mode', 'txt') != 'epub':
            return item
            
        if epub is None:
            return item
            
        # 创建EPUB章节
        chapter = epub.EpubHtml(
            title=item['chapter_title'],
            file_name=f"chapter_{len(self.chapters)}.xhtml",
            lang='zh'
        )
        
        # 设置章节内容
        chapter_content = self._format_epub_content(
            item['chapter_title'], 
            item['content']
        )
        chapter.content = chapter_content
        
        # 添加到书籍
        self.book.add_item(chapter)
        self.chapters.append(chapter)
        self.spine.append(chapter)
        
        spider.logger.info(f"添加EPUB章节: {item['chapter_title']}")
        return item
        
    def close_spider(self, spider):
        if spider.name != 'content' or getattr(spider, 'mode', 'txt') != 'epub':
            return
            
        if epub is None:
            return
            
        try:
            # 设置目录
            self.book.toc = self.chapters
            
            # 添加导航文件
            self.book.add_item(epub.EpubNcx())
            self.book.add_item(epub.EpubNav())
            
            # 设置spine
            self.book.spine = self.spine
            
            # 添加CSS样式
            style = '''
            body { 
                font-family: "SimSun", "Songti SC", serif; 
                line-height: 1.8; 
                margin: 2em;
                color: #333;
            }
            h1 { 
                text-align: center; 
                color: #333; 
                margin: 2em 0;
                font-size: 1.5em;
                border-bottom: 1px solid #ccc;
                padding-bottom: 0.5em;
            }
            p { 
                text-indent: 2em; 
                margin: 1em 0;
                text-align: justify;
            }
            '''
            nav_css = epub.EpubItem(
                uid="nav_css",
                file_name="style/nav.css",
                media_type="text/css",
                content=style
            )
            self.book.add_item(nav_css)
            
            # 输出EPUB文件
            output_path = get_content_epub_filename(self.book_name)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            epub.write_epub(output_path, self.book, {})
            
            spider.logger.info(f"EPUB文件已生成: {output_path}")
            
        except Exception as e:
            spider.logger.error(f"生成EPUB失败: {str(e)}")
    
    def _format_epub_content(self, title: str, content: str) -> str:
        """格式EPUB章节内容"""
        paragraphs = content.split('\n')
        formatted_paragraphs = []
        
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if paragraph:
                formatted_paragraphs.append(f'<p>{paragraph}</p>')
        
        content_html = '\n'.join(formatted_paragraphs)
        
        return f'''
        <html>
        <head>
            <title>{title}</title>
            <link rel="stylesheet" type="text/css" href="../style/nav.css"/>
        </head>
        <body>
            <h1>{title}</h1>
            {content_html}
        </body>
        </html>
        '''


