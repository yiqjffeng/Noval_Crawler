import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCatalog } from '@/api/catalog';
import { storage, sessionStorage } from '@/utils';
import type { 
  BookItem, 
  BookDetail, 
  CatalogData, 
  Chapter,
  LoadingState,
  ErrorState 
} from '@/types';

const STORAGE_KEYS = {
  CURRENT_BOOK: 'book_crawler_current_book',
  BOOK_CATALOG: 'book_crawler_book_catalog'
};

export const useBookStore = defineStore('book', () => {
  // 状态
  const currentBook = ref<BookDetail | null>(
    sessionStorage.get<BookDetail>(STORAGE_KEYS.CURRENT_BOOK)
  );
  
  const bookCatalog = ref<CatalogData | null>(
    sessionStorage.get<CatalogData>(STORAGE_KEYS.BOOK_CATALOG)
  );

  const loadingState = ref<LoadingState>({
    isLoading: false,
    loadingText: ''
  });

  const errorState = ref<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0
  });

  // 计算属性
  const hasCurrentBook = computed(() => currentBook.value !== null);
  const hasCatalog = computed(() => bookCatalog.value !== null);
  const isLoadingCatalog = computed(() => loadingState.value.isLoading);
  const hasError = computed(() => errorState.value.hasError);
  
  const chapterCount = computed(() => 
    bookCatalog.value?.chapters.length || 0
  );
  
  const bookInfo = computed(() => 
    bookCatalog.value?.novel_info || null
  );

  // Actions
  const setCurrentBook = (book: BookItem): void => {
    const bookDetail: BookDetail = {
      ...book,
      catalog: undefined,
      isLoadingCatalog: false
    };
    
    currentBook.value = bookDetail;
    sessionStorage.set(STORAGE_KEYS.CURRENT_BOOK, bookDetail);
    
    // 清除之前的目录和错误状态
    bookCatalog.value = null;
    sessionStorage.remove(STORAGE_KEYS.BOOK_CATALOG);
    clearError();
  };

  const loadBookCatalog = async (novelId: number): Promise<void> => {
    if (!currentBook.value) {
      setError({
        code: 'NO_CURRENT_BOOK',
        message: '请先选择一本书籍',
        details: null
      });
      return;
    }

    setLoading(true, '正在加载目录...');
    clearError();

    try {
      const response = await getCatalog({ novel_id: novelId });
      
      if (response.status === 'success' && response.data) {
        bookCatalog.value = response.data;
        sessionStorage.set(STORAGE_KEYS.BOOK_CATALOG, response.data);
        
        // 更新当前书籍信息
        if (currentBook.value) {
          currentBook.value.catalog = response.data;
          currentBook.value.total_chapters = response.data.novel_info.total_chapters;
          sessionStorage.set(STORAGE_KEYS.CURRENT_BOOK, currentBook.value);
        }
        
        clearError();
      } else {
        throw new Error(response.message || '加载目录失败');
      }
    } catch (error: any) {
      console.error('加载目录失败:', error);
      setError({
        code: 'CATALOG_LOAD_ERROR',
        message: error.message || '加载目录失败，请稍后重试',
        details: error
      });
      bookCatalog.value = null;
    } finally {
      setLoading(false);
    }
  };

  const retryLoadCatalog = async (): Promise<void> => {
    if (currentBook.value?.novel_id) {
      await loadBookCatalog(parseInt(currentBook.value.novel_id));
    }
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

  // 目录章节操作
  const getChapter = (index: number): Chapter | null => {
    if (!bookCatalog.value || index < 0 || index >= bookCatalog.value.chapters.length) {
      return null;
    }
    return bookCatalog.value.chapters[index];
  };

  const findChapterByTitle = (title: string): { chapter: Chapter; index: number } | null => {
    if (!bookCatalog.value) return null;
    
    const index = bookCatalog.value.chapters.findIndex(chapter => 
      chapter.title.toLowerCase().includes(title.toLowerCase())
    );
    
    if (index === -1) return null;
    
    return {
      chapter: bookCatalog.value.chapters[index],
      index
    };
  };

  const getChapterRange = (startIndex: number, endIndex: number): Chapter[] => {
    if (!bookCatalog.value) return [];
    
    const start = Math.max(0, startIndex);
    const end = Math.min(bookCatalog.value.chapters.length - 1, endIndex);
    
    return bookCatalog.value.chapters.slice(start, end + 1);
  };

  // 重置状态
  const reset = (): void => {
    currentBook.value = null;
    bookCatalog.value = null;
    clearError();
    setLoading(false);
    
    // 清除会话存储
    sessionStorage.remove(STORAGE_KEYS.CURRENT_BOOK);
    sessionStorage.remove(STORAGE_KEYS.BOOK_CATALOG);
  };

  const resetCatalog = (): void => {
    bookCatalog.value = null;
    clearError();
    setLoading(false);
    sessionStorage.remove(STORAGE_KEYS.BOOK_CATALOG);
  };

  return {
    // 状态
    currentBook,
    bookCatalog,
    loadingState,
    errorState,
    
    // 计算属性
    hasCurrentBook,
    hasCatalog,
    isLoadingCatalog,
    hasError,
    chapterCount,
    bookInfo,
    
    // Actions
    setCurrentBook,
    loadBookCatalog,
    setLoading,
    setError,
    clearError,
    retryLoadCatalog,
    getChapter,
    findChapterByTitle,
    getChapterRange,
    reset,
    resetCatalog
  };
});