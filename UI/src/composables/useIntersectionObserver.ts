import { ref, onMounted, onUnmounted, type Ref } from 'vue';

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /**
   * 是否立即开始观察
   */
  immediate?: boolean;
}

export interface UseIntersectionObserverReturn {
  /**
   * 是否正在相交
   */
  isIntersecting: Ref<boolean>;
  /**
   * 手动停止观察
   */
  stop: () => void;
  /**
   * 手动开始观察
   */
  start: () => void;
  /**
   * 检查浏览器是否支持 IntersectionObserver
   */
  isSupported: boolean;
}

/**
 * 响应式的 Intersection Observer API 组合函数
 * 用于监听元素是否进入视口，常用于懒加载
 * 
 * @param target 要观察的目标元素
 * @param callback 当元素进入/离开视口时的回调函数
 * @param options 配置选项
 * @returns 返回观察状态和控制方法
 */
export function useIntersectionObserver(
  target: Ref<Element | undefined> | Element,
  callback: IntersectionObserverCallback,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    immediate = true,
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    ...restOptions
  } = options;

  const isIntersecting = ref(false);
  let observer: IntersectionObserver | undefined;

  // 检查浏览器支持
  const isSupported = typeof window !== 'undefined' && 'IntersectionObserver' in window;

  /**
   * 停止观察
   */
  const stop = () => {
    if (observer) {
      observer.disconnect();
      observer = undefined;
    }
  };

  /**
   * 开始观察
   */
  const start = () => {
    if (!isSupported) {
      console.warn('IntersectionObserver is not supported in this browser');
      return;
    }

    stop(); // 先停止之前的观察

    const targetElement = target instanceof Element ? target : target.value;
    if (!targetElement) return;

    observer = new IntersectionObserver(
      (entries) => {
        // 更新相交状态
        const entry = entries[0];
        if (entry) {
          isIntersecting.value = entry.isIntersecting;
        }
        
        // 调用用户提供的回调
        callback(entries, observer!);
      },
      {
        threshold,
        root,
        rootMargin,
        ...restOptions
      }
    );

    observer.observe(targetElement);
  };

  // 生命周期管理
  if (immediate) {
    onMounted(start);
  }

  onUnmounted(stop);

  return {
    isIntersecting,
    stop,
    start,
    isSupported
  };
}

/**
 * 简化版的懒加载 Hook
 * 专门用于触发懒加载
 * 
 * @param target 目标元素
 * @param onIntersect 进入视口时的回调
 * @param options 配置选项
 */
export function useLazyLoad(
  target: Ref<Element | undefined>,
  onIntersect: () => void | Promise<void>,
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0.1, rootMargin = '200px', ...rest } = options;

  return useIntersectionObserver(
    target,
    ([{ isIntersecting }]) => {
      if (isIntersecting) {
        onIntersect();
      }
    },
    {
      threshold,
      rootMargin,
      ...rest
    }
  );
}