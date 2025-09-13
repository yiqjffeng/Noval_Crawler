import { ref, computed, nextTick, type Ref } from 'vue';

export interface UseVirtualScrollOptions {
  /**
   * 每个项目的固定高度（像素）
   */
  itemHeight: number;
  /**
   * 容器高度（像素）
   */
  containerHeight: number;
  /**
   * 缓冲区大小（额外渲染的项目数量）
   */
  buffer?: number;
  /**
   * 是否启用平滑滚动
   */
  smoothScroll?: boolean;
  /**
   * 是否启用日志
   */
  enableLogs?: boolean;
}

export interface UseVirtualScrollReturn<T> {
  /**
   * 当前可见的项目列表
   */
  visibleItems: Ref<T[]>;
  /**
   * 滚动容器的样式
   */
  containerStyle: Ref<Record<string, string>>;
  /**
   * 可见项目的偏移样式
   */
  offsetStyle: Ref<Record<string, string>>;
  /**
   * 总高度
   */
  totalHeight: Ref<number>;
  /**
   * 开始索引
   */
  startIndex: Ref<number>;
  /**
   * 结束索引
   */
  endIndex: Ref<number>;
  /**
   * 当前滚动位置
   */
  scrollTop: Ref<number>;
  /**
   * 处理滚动事件
   */
  handleScroll: (event: Event) => void;
  /**
   * 滚动到指定索引
   */
  scrollToIndex: (index: number) => void;
  /**
   * 设置数据源
   */
  setItems: (items: T[]) => void;
  /**
   * 更新容器高度
   */
  updateContainerHeight: (height: number) => void;
  /**
   * 获取项目样式
   */
  getItemStyle: (index: number) => Record<string, string>;
}

/**
 * 虚拟滚动 Hook
 * 用于处理大量数据的高性能滚动列表
 * 
 * @param items 数据源
 * @param options 配置选项
 * @returns 虚拟滚动相关状态和方法
 */
export function useVirtualScroll<T>(
  items: Ref<T[]>,
  options: UseVirtualScrollOptions
): UseVirtualScrollReturn<T> {
  const {
    itemHeight,
    containerHeight: initialContainerHeight,
    buffer = 5,
    smoothScroll = true,
    enableLogs = false
  } = options;

  // 状态
  const scrollTop = ref(0);
  const containerHeight = ref(initialContainerHeight);

  // 计算属性
  const totalHeight = computed(() => items.value.length * itemHeight);

  const startIndex = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight);
    return Math.max(0, start - buffer);
  });

  const endIndex = computed(() => {
    const visibleCount = Math.ceil(containerHeight.value / itemHeight);
    const end = startIndex.value + visibleCount + buffer * 2;
    return Math.min(items.value.length - 1, end);
  });

  const visibleItems = computed(() => {
    return items.value.slice(startIndex.value, endIndex.value + 1);
  });

  const containerStyle = computed(() => ({
    height: `${containerHeight.value}px`,
    overflow: 'auto',
    position: 'relative'
  }));

  const offsetStyle = computed(() => ({
    transform: `translateY(${startIndex.value * itemHeight}px)`,
    position: 'relative'
  }));

  /**
   * 处理滚动事件
   */
  const handleScroll = (event: Event): void => {
    const target = event.target as HTMLElement;
    const newScrollTop = target.scrollTop;
    
    scrollTop.value = newScrollTop;

    if (enableLogs) {
      console.log(`虚拟滚动: 位置 ${newScrollTop}, 显示 ${startIndex.value}-${endIndex.value}`);
    }
  };

  /**
   * 滚动到指定索引
   */
  const scrollToIndex = (index: number): void => {
    const targetIndex = Math.max(0, Math.min(index, items.value.length - 1));
    const targetScrollTop = targetIndex * itemHeight;

    // 使用 Element.scrollTo 进行滚动
    const scrollBehavior = smoothScroll ? 'smooth' : 'auto';
    
    // 需要在组件中调用时传入实际的容器元素
    if (enableLogs) {
      console.log(`虚拟滚动: 跳转到索引 ${targetIndex}, 滚动位置 ${targetScrollTop}`);
    }

    // 返回滚动信息，由调用者执行实际滚动
    return {
      top: targetScrollTop,
      behavior: scrollBehavior
    };
  };

  /**
   * 设置数据源
   */
  const setItems = (newItems: T[]): void => {
    items.value = newItems;
    scrollTop.value = 0;

    if (enableLogs) {
      console.log(`虚拟滚动: 设置 ${newItems.length} 个项目`);
    }
  };

  /**
   * 更新容器高度
   */
  const updateContainerHeight = (height: number): void => {
    containerHeight.value = height;
    
    if (enableLogs) {
      console.log(`虚拟滚动: 更新容器高度为 ${height}px`);
    }
  };

  /**
   * 获取项目的定位样式
   */
  const getItemStyle = (index: number): Record<string, string> => {
    const actualIndex = startIndex.value + index;
    
    return {
      position: 'absolute',
      top: `${actualIndex * itemHeight}px`,
      height: `${itemHeight}px`,
      width: '100%',
      left: '0'
    };
  };

  return {
    visibleItems,
    containerStyle,
    offsetStyle,
    totalHeight,
    startIndex,
    endIndex,
    scrollTop,
    handleScroll,
    scrollToIndex,
    setItems,
    updateContainerHeight,
    getItemStyle
  };
}

/**
 * 章节目录虚拟滚动专用 Hook
 * 针对小说章节目录优化的虚拟滚动实现
 */
export function useChapterVirtualScroll<T>(
  chapters: Ref<T[]>,
  options: Partial<UseVirtualScrollOptions> = {}
) {
  const virtualScroll = useVirtualScroll(chapters, {
    itemHeight: 48, // 章节项高度
    containerHeight: 600, // 默认容器高度
    buffer: 10, // 增加缓冲区
    smoothScroll: true,
    enableLogs: true,
    ...options
  });

  /**
   * 跳转到指定章节
   */
  const jumpToChapter = (
    chapterNumber: number,
    scrollContainer: HTMLElement
  ): void => {
    const targetIndex = chapterNumber - 1;
    const scrollInfo = virtualScroll.scrollToIndex(targetIndex);
    
    if (scrollContainer && scrollInfo) {
      scrollContainer.scrollTo({
        top: scrollInfo.top,
        behavior: scrollInfo.behavior as ScrollBehavior
      });
    }
  };

  /**
   * 查找章节索引
   */
  const findChapterIndex = (
    predicate: (chapter: T, index: number) => boolean
  ): number => {
    return chapters.value.findIndex(predicate);
  };

  return {
    ...virtualScroll,
    jumpToChapter,
    findChapterIndex
  };
}