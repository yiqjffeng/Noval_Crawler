import type { ApiResponse } from './common';

// 书籍基本信息
export interface BookItem {
  url_list: string;
  url_img: string;
  articlename: string;
  author: string;
  intro: string;
  // 新增字段
  index?: number;          // 在搜索结果中的索引位置
  searchKeyword?: string;  // 搜索关键词，用于API调用
}

// 搜索相关类型
export interface SearchRequest {
  keyword: string;
}

export interface SearchResponse extends ApiResponse<BookItem[]> {
  keyword: string;
}

// 章节信息
export interface Chapter {
  title: string;
  url: string;
}

// 小说详细信息
export interface NovelInfo {
  novel_id: string;
  novel_title: string;
  author: string;
  total_chapters: number;
  domain: string;
  detail_url: string;
}

// 目录数据
export interface CatalogData {
  novel_info: NovelInfo;
  chapters: Chapter[];
}

// 目录请求
export interface CatalogRequest {
  novel_id: number;
}

// 目录响应
export interface CatalogResponse extends ApiResponse<CatalogData> {
  novel_id: number;
  book_name: string;
  novel_url: string;
}

// 书籍详情（用于前端展示）
export interface BookDetail extends BookItem {
  novel_id?: string;
  searchKeyword?: string;  // 搜索关键词，用于目录API调用
  total_chapters?: number;
  catalog?: CatalogData;
  isLoadingCatalog?: boolean;
}

// 搜索历史记录
export interface SearchHistoryItem {
  keyword: string;
  timestamp: number;
  resultsCount: number;
}

// 错误状态
export interface ErrorState {
  hasError: boolean;
  errorMessage: string;
  errorType: 'network' | 'data' | 'not_found' | 'unknown';
}

// 数据恢复结果
export interface DataRestoreResult {
  success: boolean;
  data?: BookItem;
  message?: string;
}

// 缓存的搜索结果
export interface CachedSearchResult {
  results: BookItem[] | null;
  keyword: string;
  timestamp: number;
}