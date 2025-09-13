import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { searchBooks, getSearchSuggestions } from '@/api/search';
import { storage } from '@/utils';
import type { 
  BookItem, 
  SearchRequest, 
  SearchHistoryItem,
  LoadingState,
  ErrorState 
} from '@/types';

const STORAGE_KEYS = {
  SEARCH_HISTORY: 'book_crawler_search_history',
  RECENT_SEARCHES: 'book_crawler_recent_searches'
};

export const useSearchStore = defineStore('search', () => {
  // 状态
  const searchResults = ref<BookItem[]>([]);
  const currentKeyword = ref<string>('');
  const searchSuggestions = ref<string[]>([]);
  const loadingState = ref<LoadingState>({
    isLoading: false,
    loadingText: ''
  });
  const errorState = ref<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0
  });

  // 搜索历史
  const searchHistory = ref<SearchHistoryItem[]>(
    storage.get<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY, [])
  );

  // 计算属性
  const hasResults = computed(() => searchResults.value.length > 0);
  const isSearching = computed(() => loadingState.value.isLoading);
  const hasError = computed(() => errorState.value.hasError);
  const recentKeywords = computed(() => 
    searchHistory.value
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(item => item.keyword)
  );

  // 搜索统计
  const searchStats = computed(() => ({
    totalSearches: searchHistory.value.length,
    totalResults: searchResults.value.length,
    averageResults: searchHistory.value.length > 0 
      ? Math.round(searchHistory.value.reduce((sum, item) => sum + item.resultsCount, 0) / searchHistory.value.length)
      : 0
  }));

  // Actions
  const performSearch = async (keyword: string): Promise<void> => {
    if (!keyword.trim()) {
      clearError();
      return;
    }

    // 设置加载状态
    setLoading(true, `正在搜索"${keyword}"...`);
    clearError();
    currentKeyword.value = keyword.trim();

    try {
      const response = await searchBooks({ keyword: currentKeyword.value });
      
      if (response.status === 'success') {
        searchResults.value = response.data || [];
        
        // 添加到搜索历史
        addToHistory(currentKeyword.value, searchResults.value.length);
        
        // 清除错误状态
        clearError();
      } else {
        throw new Error(response.message || '搜索失败');
      }
    } catch (error: any) {
      console.error('搜索失败:', error);
      setError({
        code: 'SEARCH_ERROR',
        message: error.message || '搜索失败，请稍后重试',
        details: error
      });
      searchResults.value = [];
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (keyword: string): Promise<void> => {
    if (!keyword.trim() || keyword.length < 2) {
      searchSuggestions.value = [];
      return;
    }

    try {
      const suggestions = await getSearchSuggestions(keyword);
      searchSuggestions.value = suggestions;
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      searchSuggestions.value = [];
    }
  };

  const addToHistory = (keyword: string, resultsCount: number): void => {
    const existingIndex = searchHistory.value.findIndex(item => item.keyword === keyword);
    
    const historyItem: SearchHistoryItem = {
      keyword,
      timestamp: Date.now(),
      resultsCount
    };

    if (existingIndex !== -1) {
      // 更新已存在的搜索记录
      searchHistory.value[existingIndex] = historyItem;
    } else {
      // 添加新的搜索记录
      searchHistory.value.unshift(historyItem);
      
      // 限制历史记录数量
      if (searchHistory.value.length > 50) {
        searchHistory.value = searchHistory.value.slice(0, 50);
      }
    }

    // 保存到本地存储
    storage.set(STORAGE_KEYS.SEARCH_HISTORY, searchHistory.value);
  };

  const removeFromHistory = (keyword: string): void => {
    searchHistory.value = searchHistory.value.filter(item => item.keyword !== keyword);
    storage.set(STORAGE_KEYS.SEARCH_HISTORY, searchHistory.value);
  };

  const clearHistory = (): void => {
    searchHistory.value = [];
    storage.remove(STORAGE_KEYS.SEARCH_HISTORY);
  };

  const clearResults = (): void => {
    searchResults.value = [];
    currentKeyword.value = '';
    clearError();
  };

  const setLoading = (isLoading: boolean, loadingText?: string): void => {
    loadingState.value = {
      isLoading,
      loadingText: loadingText || ''
    };
  };

  const setError = (error: { code: string; message: string; details?: any }): void => {
    errorState.value = {
      hasError: true,
      error,
      retryCount: errorState.value.retryCount + 1
    };
  };

  const clearError = (): void => {
    errorState.value = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  };

  const retrySearch = async (): Promise<void> => {
    if (currentKeyword.value) {
      await performSearch(currentKeyword.value);
    }
  };

  // 搜索结果筛选
  const filterResults = (filterFn: (book: BookItem) => boolean): BookItem[] => {
    return searchResults.value.filter(filterFn);
  };

  // 按作者筛选
  const filterByAuthor = (author: string): BookItem[] => {
    return filterResults(book => book.author.toLowerCase().includes(author.toLowerCase()));
  };

  // 搜索结果排序
  const sortResults = (sortFn: (a: BookItem, b: BookItem) => number): void => {
    searchResults.value.sort(sortFn);
  };

  // 重置状态
  const reset = (): void => {
    searchResults.value = [];
    currentKeyword.value = '';
    searchSuggestions.value = [];
    clearError();
    setLoading(false);
  };

  return {
    // 状态
    searchResults,
    currentKeyword,
    searchSuggestions,
    loadingState,
    errorState,
    searchHistory,
    
    // 计算属性
    hasResults,
    isSearching,
    hasError,
    recentKeywords,
    searchStats,
    
    // Actions
    performSearch,
    getSuggestions,
    addToHistory,
    removeFromHistory,
    clearHistory,
    clearResults,
    setLoading,
    setError,
    clearError,
    retrySearch,
    filterResults,
    filterByAuthor,
    sortResults,
    reset
  };
});