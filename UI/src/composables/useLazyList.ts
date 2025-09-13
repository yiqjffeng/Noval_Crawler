import { ref, computed, type Ref } from 'vue';

export interface UseLazyListOptions<T> {
  /**
   * 初始页面大小
   */
  initialPageSize?: number;
  /**
   * 增量加载大小
   */
  incrementSize?: number;
  /**
   * 加载延迟（毫秒）
   */
  loadDelay?: number;
  /**
   * 是否启用日志
   */
  enableLogs?: boolean;
}

export interface UseLazyListReturn<T> {
  /**
   * 当前显示的数据
   */
  displayedItems: Ref<T[]>;
  /**
   * 是否正在加载
   */
  isLoading: Ref<boolean>;
  /**
   * 是否还有更多数据
   */
  hasMore: Ref<boolean>;
  /**
   * 当前页码
   */
  currentPage: Ref<number>;
  /**
   * 剩余项目数量
   */
  remainingCount: Ref<number>;
  /**
   * 加载更多数据
   */
  loadMore: () => Promise<void>;
  /**
   * 重置列表
   */
  reset: () => void;
  /**
   * 设置全量数据
   */
  setAllItems: (items: T[]) => void;
  /**
   * 跳转到指定项目
   */
  scrollToItem: (index: number) => void;
}

/**
 * 懒加载列表 Hook
 * 用于实现分页式懒加载，支持本地数据分片显示
 * 
 * @param allItems 全量数据源
 * @param options 配置选项
 * @returns 懒加载相关状态和方法
 */
export function useLazyList<T>(
  allItems: Ref<T[]>,
  options: UseLazyListOptions<T> = {}
): UseLazyListReturn<T> {
  const {
    initialPageSize = 20,
    incrementSize = 20,
    loadDelay = 300,
    enableLogs = false
  } = options;

  // 状态
  const displayedItems = ref<T[]>([]) as Ref<T[]>;
  const isLoading = ref(false);
  const currentPage = ref(1);

  // 计算属性
  const hasMore = computed(() => 
    displayedItems.value.length < allItems.value.length
  );

  const remainingCount = computed(() => 
    Math.max(0, allItems.value.length - displayedItems.value.length)
  );

  /**
   * 加载更多数据
   */
  const loadMore = async (): Promise<void> => {
    if (isLoading.value || !hasMore.value) {
      return;
    }

    isLoading.value = true;

    try {
      // 模拟网络延迟，提升用户体验
      if (loadDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, loadDelay));
      }

      const startIndex = (currentPage.value - 1) * initialPageSize + 
                        Math.max(0, currentPage.value - 1) * (incrementSize - initialPageSize);
      const endIndex = startIndex + (currentPage.value === 1 ? initialPageSize : incrementSize);

      // 从全量数据中获取下一批
      const nextBatch = allItems.value.slice(startIndex, endIndex);
      
      if (nextBatch.length > 0) {
        displayedItems.value.push(...nextBatch);
        currentPage.value++;

        if (enableLogs) {
          console.log(`懒加载: 已加载 ${displayedItems.value.length}/${allItems.value.length} 项`);
        }
      }
    } catch (error) {
      console.error('懒加载失败:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 重置列表状态
   */
  const reset = (): void => {
    displayedItems.value = [];
    currentPage.value = 1;
    isLoading.value = false;

    if (enableLogs) {
      console.log('懒加载列表已重置');
    }
  };

  /**
   * 设置全量数据并重置显示
   */
  const setAllItems = (items: T[]): void => {
    allItems.value = items;
    reset();
    
    // 自动加载第一页
    if (items.length > 0) {
      loadMore();
    }

    if (enableLogs) {
      console.log(`设置全量数据: ${items.length} 项`);
    }
  };

  /**
   * 滚动到指定项目（如果已加载）
   */
  const scrollToItem = (index: number): void => {
    const targetIndex = Math.min(index, allItems.value.length - 1);
    
    // 如果目标项目尚未加载，先加载到那个位置
    while (displayedItems.value.length <= targetIndex && hasMore.value) {
      loadMore();
    }

    if (enableLogs) {
      console.log(`滚动到项目索引: ${targetIndex}`);
    }
  };

  /**
   * 初始化：加载第一页数据
   */
  const initialize = (): void => {
    if (allItems.value.length > 0 && displayedItems.value.length === 0) {
      loadMore();
    }
  };

  // 监听数据变化，自动初始化
  if (allItems.value.length > 0) {
    initialize();
  }

  return {
    displayedItems,
    isLoading,
    hasMore,
    currentPage,
    remainingCount,
    loadMore,
    reset,
    setAllItems,
    scrollToItem
  };
}

/**
 * 搜索结果懒加载专用 Hook
 * 针对搜索结果优化的懒加载实现
 */
export function useSearchResultsLazy<T>(options: UseLazyListOptions<T> = {}) {
  const allResults = ref<T[]>([]) as Ref<T[]>;
  
  const lazyList = useLazyList(allResults, {
    initialPageSize: 20,
    incrementSize: 20,
    loadDelay: 300,
    enableLogs: true,
    ...options
  });

  /**
   * 设置搜索结果
   */
  const setSearchResults = (results: T[]): void => {
    lazyList.setAllItems(results);
  };

  /**
   * 清空搜索结果
   */
  const clearResults = (): void => {
    lazyList.setAllItems([]);
  };

  return {
    ...lazyList,
    allResults,
    setSearchResults,
    clearResults
  };
}