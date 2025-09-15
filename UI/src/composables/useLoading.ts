import { ref, computed, reactive } from 'vue'
import type { Ref } from 'vue'

export interface LoadingState {
  isLoading: boolean
  progress?: number
  text?: string
  type?: 'spinner' | 'pulse' | 'skeleton' | 'dots' | 'wave' | 'orbit'
  error?: string
}

export interface LoadingOptions {
  delay?: number
  timeout?: number
  minDuration?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useLoading(initialState: boolean = false) {
  const loading = ref(initialState)
  const progress = ref(0)
  const text = ref('')
  const type = ref<'spinner' | 'pulse' | 'skeleton' | 'dots' | 'wave' | 'orbit'>('spinner')
  const error = ref('')

  const startTime = ref(0)
  const minDurationTimer = ref<NodeJS.Timeout | null>(null)

  const isLoading = computed(() => loading.value)
  const loadingText = computed(() => text.value)
  const loadingProgress = computed(() => progress.value)
  const loadingType = computed(() => type.value)
  const loadingError = computed(() => error.value)

  const start = (options: {
    text?: string
    type?: typeof type.value
    minDuration?: number
  } = {}) => {
    loading.value = true
    progress.value = 0
    text.value = options.text || ''
    type.value = options.type || 'spinner'
    error.value = ''
    startTime.value = Date.now()

    // 设置最小持续时间
    if (options.minDuration) {
      minDurationTimer.value = setTimeout(() => {
        minDurationTimer.value = null
      }, options.minDuration)
    }
  }

  const update = (options: {
    progress?: number
    text?: string
  } = {}) => {
    if (options.progress !== undefined) {
      progress.value = Math.min(100, Math.max(0, options.progress))
    }
    if (options.text) {
      text.value = options.text
    }
  }

  const stop = () => {
    if (minDurationTimer.value) {
      clearTimeout(minDurationTimer.value)
      minDurationTimer.value = null
    }
    
    const elapsed = Date.now() - startTime.value
    const minDuration = 500 // 最小500ms避免闪烁
    
    if (elapsed < minDuration) {
      setTimeout(() => {
        loading.value = false
        progress.value = 0
        text.value = ''
      }, minDuration - elapsed)
    } else {
      loading.value = false
      progress.value = 0
      text.value = ''
    }
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
    loading.value = false
  }

  const withLoading = async <T>(
    fn: () => Promise<T>,
    options: LoadingOptions & {
      text?: string
      type?: typeof type.value
    } = {}
  ): Promise<T> => {
    try {
      start({
        text: options.text || '加载中...',
        type: options.type || 'spinner',
        minDuration: options.minDuration
      })

      const result = await fn()
      
      // 模拟渐进式完成
      update({ progress: 100 })
      setTimeout(() => {
        stop()
        options.onSuccess?.()
      }, 300)

      return result
    } catch (err) {
      const error = err as Error
      setError(error.message)
      options.onError?.(error)
      throw error
    }
  }

  const simulateProgress = (duration: number = 2000, steps: number = 10) => {
    const stepDuration = duration / steps
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      const progress = Math.min(100, (currentStep / steps) * 100)
      update({ progress })

      if (currentStep >= steps) {
        clearInterval(interval)
        setTimeout(() => stop(), 500)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }

  return {
    loading,
    isLoading,
    progress: loadingProgress,
    text: loadingText,
    type: loadingType,
    error: loadingError,
    start,
    stop,
    update,
    setError,
    withLoading,
    simulateProgress
  }
}

// 全局加载管理器
export const createGlobalLoading = () => {
  const state = reactive<LoadingState>({
    isLoading: false,
    progress: 0,
    text: '',
    type: 'spinner'
  })

  const activeRequests = ref(0)

  const start = (options: Partial<LoadingState> = {}) => {
    activeRequests.value++
    if (activeRequests.value === 1) {
      state.isLoading = true
      state.progress = options.progress || 0
      state.text = options.text || ''
      state.type = options.type || 'spinner'
    }
  }

  const stop = () => {
    activeRequests.value = Math.max(0, activeRequests.value - 1)
    if (activeRequests.value === 0) {
      state.isLoading = false
      state.progress = 0
      state.text = ''
    }
  }

  const update = (options: Partial<LoadingState> = {}) => {
    if (state.isLoading) {
      Object.assign(state, options)
    }
  }

  return {
    state,
    start,
    stop,
    update
  }
}

// 延迟加载Hook
export function useDelayedLoading(delay: number = 300) {
  const { loading, ...rest } = useLoading()
  const delayedLoading = ref(false)
  let timer: NodeJS.Timeout | null = null

  const updateDelayedLoading = () => {
    if (timer) clearTimeout(timer)
    
    if (loading.value) {
      timer = setTimeout(() => {
        delayedLoading.value = true
      }, delay)
    } else {
      delayedLoading.value = false
    }
  }

  // 监听loading变化
  const stopWatcher = () => {
    if (timer) clearTimeout(timer)
  }

  return {
    loading: delayedLoading,
    ...rest,
    stopWatcher
  }
}

// 分页加载Hook
export function usePaginatedLoading<T>() {
  const items = ref<T[]>([])
  const loading = useLoading()
  const hasMore = ref(true)
  const page = ref(1)

  const loadMore = async (
    fetchFn: (page: number) => Promise<{ items: T[]; hasMore: boolean }>
  ) => {
    if (!hasMore.value || loading.isLoading.value) return

    await loading.withLoading(async () => {
      const result = await fetchFn(page.value)
      items.value.push(...result.items)
      hasMore.value = result.hasMore
      if (result.hasMore) page.value++
    })
  }

  const reset = () => {
    items.value = []
    hasMore.value = true
    page.value = 1
  }

  return {
    items,
    loading,
    hasMore,
    page,
    loadMore,
    reset
  }
}

// 防抖加载Hook
export function useDebouncedLoading(debounceMs: number = 300) {
  const { loading, ...rest } = useLoading()
  let debounceTimer: NodeJS.Timeout | null = null

  const debouncedStart = (options: Parameters<typeof rest.start>[0] = {}) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      rest.start(options)
    }, debounceMs)
  }

  const debouncedStop = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    rest.stop()
  }

  return {
    loading,
    ...rest,
    start: debouncedStart,
    stop: debouncedStop
  }
}