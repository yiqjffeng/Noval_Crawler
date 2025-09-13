import httpClient from '@/utils/request';
import type { CatalogRequest, CatalogResponse } from '@/types/book';

/**
 * 获取小说目录
 * @param params 目录请求参数
 * @returns 目录数据
 */
export const getCatalog = async (params: CatalogRequest): Promise<CatalogResponse> => {
  try {
    const requestData = {
      novel_id: params.novel_id
    };
    
    const response = await httpClient.post<CatalogResponse>('/api/catalog', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 数据验证和处理
    if (!response.data || !response.data.novel_info || !response.data.chapters) {
      throw new Error('目录数据格式错误');
    }
    
    // 确保章节数据完整性
    response.data.chapters = response.data.chapters.map((chapter, index) => ({
      title: chapter.title || `第${index + 1}章`,
      url: chapter.url || '',
    }));
    
    // 确保小说信息完整性
    response.data.novel_info = {
      novel_id: response.data.novel_info.novel_id || '',
      novel_title: response.data.novel_info.novel_title || '未知书名',
      author: response.data.novel_info.author || '未知作者',
      total_chapters: response.data.novel_info.total_chapters || response.data.chapters.length,
      domain: response.data.novel_info.domain || '',
      detail_url: response.data.novel_info.detail_url || '',
    };
    
    return response;
  } catch (error: any) {
    console.error('[API] 获取目录失败:', error);
    
    // 处理CORS错误
    if (error.code === 'NETWORK_ERROR') {
      throw {
        status: 'error',
        message: '网络连接失败，请检查后端服务是否启动',
        data: {
          novel_info: {
            novel_id: '',
            novel_title: '',
            author: '',
            total_chapters: 0,
            domain: '',
            detail_url: '',
          },
          chapters: [],
        },
        novel_id: params.novel_id,
        book_name: '',
        novel_url: '',
      } as CatalogResponse;
    }
    
    throw {
      status: 'error',
      message: error.message || '获取目录失败，请重试',
      data: {
        novel_info: {
          novel_id: '',
          novel_title: '',
          author: '',
          total_chapters: 0,
          domain: '',
          detail_url: '',
        },
        chapters: [],
      },
      novel_id: params.novel_id,
      book_name: '',
      novel_url: '',
    } as CatalogResponse;
  }
};