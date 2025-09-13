import httpClient from '@/utils/request';
import type { SearchRequest, SearchResponse } from '@/types/book';

/**
 * 搜索小说
 * @param params 搜索参数
 * @returns 搜索结果
 */
export const searchBooks = async (params: SearchRequest): Promise<SearchResponse> => {
  try {
    // 确保参数格式正确
    const requestData = {
      keyword: params.keyword.trim()
    };
    
    const response = await httpClient.post<SearchResponse>('/api/search', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 数据验证和处理
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('搜索结果格式错误');
    }
    
    // 处理搜索结果，确保必要字段存在
    response.data = response.data.map(book => ({
      url_list: book.url_list || '',
      url_img: book.url_img || '/default-book-cover.jpg',
      articlename: book.articlename || '未知书名',
      author: book.author || '未知作者',
      intro: book.intro || '暂无简介',
    }));
    
    return response;
  } catch (error: any) {
    console.error('[API] 搜索失败:', error);
    
    // 处理CORS错误
    if (error.code === 'NETWORK_ERROR') {
      throw {
        status: 'error',
        message: '网络连接失败，请检查后端服务是否启动',
        data: [],
        keyword: params.keyword,
      } as SearchResponse;
    }
    
    throw {
      status: 'error',
      message: error.message || '搜索失败，请重试',
      data: [],
      keyword: params.keyword,
    } as SearchResponse;
  }
};

/**
 * 获取搜索建议（可选实现）
 * @param keyword 关键词
 * @returns 搜索建议列表
 */
export const getSearchSuggestions = async (keyword: string): Promise<string[]> => {
  try {
    // 这里可以实现搜索建议的API调用
    // 目前返回空数组，后续可以根据需要实现
    return [];
  } catch (error) {
    console.error('[API] 获取搜索建议失败:', error);
    return [];
  }
};