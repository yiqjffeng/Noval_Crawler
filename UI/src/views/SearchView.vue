<template>
  <div class="search-view">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle decoration-circle-1"></div>
      <div class="decoration-circle decoration-circle-2"></div>
      <div class="decoration-circle decoration-circle-3"></div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="search-container">
      <!-- 应用标题 -->
      <div ref="titleRef" class="app-title">
        <h1 class="title-text">
          <span class="title-icon">📚</span>
          小说爬虫
        </h1>
        <p class="title-subtitle">发现你的下一本好书</p>
      </div>
      
      <!-- 搜索区域 -->
      <div ref="searchSectionRef" class="search-section">
        <div class="search-box-container">
          <!-- 主搜索框 -->
          <div 
            ref="searchBoxRef"
            class="search-box"
            :class="{ 'search-box-focused': isSearchFocused }"
          >
            <div class="search-input-wrapper">
              <SearchIcon class="search-icon" />
              <input
                ref="searchInputRef"
                v-model="searchKeyword"
                type="text"
                class="search-input"
                placeholder="输入小说名称或作者"
                @focus="onSearchFocus"
                @blur="onSearchBlur"
                @keydown.enter="handleSearch"
                @input="onSearchInput"
              />
              
              <!-- 清除按钮 -->
              <button
                v-if="searchKeyword"
                class="clear-button"
                @click="clearSearch"
              >
                <XMarkIcon class="clear-icon" />
              </button>
            </div>
            
            <!-- 搜索建议 -->
            <div 
              v-if="showSuggestions && searchSuggestions.length > 0"
              ref="suggestionsRef"
              class="search-suggestions"
            >
              <div
                v-for="(suggestion, index) in searchSuggestions"
                :key="suggestion"
                class="suggestion-item"
                @click="selectSuggestion(suggestion)"
              >
                <MagnifyingGlassIcon class="suggestion-icon" />
                <span class="suggestion-text">{{ suggestion }}</span>
              </div>
            </div>
          </div>
          
          <!-- 搜索按钮 -->
          <BaseButton
            ref="searchButtonRef"
            variant="primary"
            size="large"
            :loading="isSearching"
            :disabled="!searchKeyword.trim()"
            @click="handleSearch"
            class="search-button"
          >
            <template v-if="!isSearching">
              搜索
            </template>
            <template v-else>
              搜索中...
            </template>
          </BaseButton>
        </div>
        
        <!-- 搜索选项 -->
        <div class="search-options">
          <div class="search-filters">
            <!-- 这里可以添加搜索过滤选项 -->
          </div>
        </div>
      </div>
      
      <!-- 搜索历史 -->
      <div 
        v-if="recentKeywords.length > 0 && !searchKeyword"
        ref="historyRef"
        class="search-history"
      >
        <div class="history-header">
          <h3 class="history-title">
            <ClockIcon class="history-icon" />
            最近搜索
          </h3>
          <button class="clear-history-btn" @click="clearSearchHistory">
            <TrashIcon class="trash-icon" />
            清空
          </button>
        </div>
        
        <div class="history-tags">
          <button
            v-for="keyword in recentKeywords.slice(0, 8)"
            :key="keyword"
            class="history-tag"
            @click="selectHistoryKeyword(keyword)"
          >
            {{ keyword }}
          </button>
        </div>
      </div>
      
      <!-- 快速入口 -->
      <div ref="quickAccessRef" class="quick-access">
        <h3 class="quick-access-title">快速开始</h3>
        <div class="quick-access-grid">
          <div class="quick-access-item" @click="navigateToTasks">
            <div class="quick-access-icon">
              <QueueListIcon />
            </div>
            <div class="quick-access-content">
              <h4>下载任务</h4>
              <p>查看进行中的下载</p>
            </div>
            <div class="quick-access-badge" v-if="activeTasksCount > 0">
              {{ activeTasksCount }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="hasError" class="error-section">
        <div class="error-message">
          <ExclamationTriangleIcon class="error-icon" />
          <div class="error-content">
            <h4 class="error-title">搜索出错了</h4>
            <p class="error-text">{{ errorState.error?.message }}</p>
            <BaseButton 
              variant="ghost" 
              size="small" 
              @click="retrySearch"
              class="retry-button"
            >
              重试
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useSearchStore, useBookStore, useDownloadStore } from '@/stores';
import { BaseButton } from '@/components/common';
import { debounce } from '@/utils';
import { gsap } from 'gsap';

// Icons
import {
  MagnifyingGlassIcon as SearchIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  TrashIcon,
  QueueListIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const searchStore = useSearchStore();
const bookStore = useBookStore();
const downloadStore = useDownloadStore();

// 模板引用
const titleRef = ref<HTMLElement>();
const searchSectionRef = ref<HTMLElement>();
const searchBoxRef = ref<HTMLElement>();
const searchInputRef = ref<HTMLInputElement>();
const searchButtonRef = ref<HTMLElement>();
const historyRef = ref<HTMLElement>();
const quickAccessRef = ref<HTMLElement>();
const suggestionsRef = ref<HTMLElement>();

// 响应式数据
const searchKeyword = ref('');
const isSearchFocused = ref(false);
const showSuggestions = ref(false);

// 计算属性
const isSearching = computed(() => searchStore.isSearching);
const hasError = computed(() => searchStore.hasError);
const errorState = computed(() => searchStore.errorState);
const recentKeywords = computed(() => searchStore.recentKeywords);
const searchSuggestions = computed(() => searchStore.searchSuggestions);
const activeTasksCount = computed(() => downloadStore.runningTasks.length);

// 防抖搜索建议
const debouncedGetSuggestions = debounce(async (keyword: string) => {
  if (keyword.length >= 2) {
    await searchStore.getSuggestions(keyword);
    showSuggestions.value = true;
  } else {
    showSuggestions.value = false;
  }
}, 300);

// 事件处理
const onSearchFocus = () => {
  isSearchFocused.value = true;
  if (searchInputRef.value && searchBoxRef.value) {
    gsap.to(searchBoxRef.value, {
      scale: 1.02,
      boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
      duration: 0.3,
      ease: 'power2.out'
    });
  }
};

const onSearchBlur = () => {
  isSearchFocused.value = false;
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200); // 延迟隐藏，让点击建议有时间执行
  
  if (searchBoxRef.value) {
    gsap.to(searchBoxRef.value, {
      scale: 1,
      boxShadow: '0 0 0px rgba(59, 130, 246, 0)',
      duration: 0.3,
      ease: 'power2.out'
    });
  }
};

const onSearchInput = () => {
  debouncedGetSuggestions(searchKeyword.value);
};

const handleSearch = async () => {
  if (!searchKeyword.value.trim() || isSearching.value) return;
  
  try {
    await searchStore.performSearch(searchKeyword.value);
    
    if (searchStore.hasResults) {
      // 跳转到搜索结果页面
      router.push({
        name: 'SearchResults',
        query: { keyword: searchKeyword.value }
      });
    }
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

const clearSearch = () => {
  searchKeyword.value = '';
  showSuggestions.value = false;
  searchInputRef.value?.focus();
};

const selectSuggestion = (suggestion: string) => {
  searchKeyword.value = suggestion;
  showSuggestions.value = false;
  handleSearch();
};

const selectHistoryKeyword = (keyword: string) => {
  searchKeyword.value = keyword;
  handleSearch();
};

const clearSearchHistory = () => {
  searchStore.clearHistory();
};

const retrySearch = () => {
  searchStore.retrySearch();
};

// 导航方法
const navigateToTasks = () => {
  router.push({ name: 'DownloadTasks' });
};

// 页面动画
const playEnterAnimation = async () => {
  const tl = gsap.timeline();
  
  // 标题动画
  if (titleRef.value) {
    tl.fromTo(titleRef.value,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );
  }
  
  // 搜索区域动画
  if (searchSectionRef.value) {
    tl.fromTo(searchSectionRef.value,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    );
  }
  
  // 历史记录动画
  if (historyRef.value) {
    tl.fromTo(historyRef.value,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );
  }
  
  // 快速入口动画
  if (quickAccessRef.value) {
    tl.fromTo(quickAccessRef.value,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    );
  }
};

// 生命周期
onMounted(() => {
  nextTick(() => {
    playEnterAnimation();
  });
  
  // 自动聚焦搜索框
  setTimeout(() => {
    searchInputRef.value?.focus();
  }, 1000);
});

// 监听点击外部关闭建议
watch(() => showSuggestions.value, (newValue) => {
  if (newValue) {
    const handleClickOutside = (event: Event) => {
      if (suggestionsRef.value && !suggestionsRef.value.contains(event.target as Node)) {
        showSuggestions.value = false;
        document.removeEventListener('click', handleClickOutside);
      }
    };
    
    nextTick(() => {
      document.addEventListener('click', handleClickOutside);
    });
  }
});
</script>

<style scoped lang="scss">
.search-view {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  
  &.decoration-circle-1 {
    width: 300px;
    height: 300px;
    top: -150px;
    right: -150px;
    animation: float 8s ease-in-out infinite;
  }
  
  &.decoration-circle-2 {
    width: 200px;
    height: 200px;
    bottom: -100px;
    left: -100px;
    animation: float 6s ease-in-out infinite reverse;
  }
  
  &.decoration-circle-3 {
    width: 150px;
    height: 150px;
    top: 50%;
    right: 10%;
    animation: float 10s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.search-container {
  width: 100%;
  max-width: 600px;
  position: relative;
  z-index: 1;
}

.app-title {
  text-align: center;
  margin-bottom: 3rem;
}

.title-text {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
}

.title-subtitle {
  color: #94a3b8;
  font-size: 1.125rem;
  margin: 0.5rem 0 0 0;
  font-weight: 400;
}

.search-section {
  margin-bottom: 2rem;
}

.search-box-container {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.search-box {
  flex: 1;
  position: relative;
  transition: all 0.3s ease-in-out;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid #334155;
  border-radius: 0.75rem;
  padding: 0 1rem;
  transition: all 0.3s ease-in-out;
  backdrop-filter: blur(8px);
  
  &:hover {
    border-color: #475569;
  }
  
  .search-box-focused & {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.search-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f8fafc;
  font-size: 1.125rem;
  padding: 1rem 0;
  
  &::placeholder {
    color: #64748b;
  }
}

.clear-button {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    color: #94a3b8;
    background: rgba(100, 116, 139, 0.1);
  }
}

.clear-icon {
  width: 1rem;
  height: 1rem;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #334155;
  }
}

.suggestion-icon {
  width: 1rem;
  height: 1rem;
  color: #64748b;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.suggestion-text {
  color: #cbd5e1;
  font-size: 0.875rem;
}

.search-button {
  flex-shrink: 0;
  height: fit-content;
}

.search-history {
  margin-bottom: 2rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.history-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
}

.clear-history-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
}

.trash-icon {
  width: 1rem;
  height: 1rem;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.history-tag {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }
}

.quick-access {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
}

.quick-access-title {
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.quick-access-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.quick-access-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  position: relative;
  
  &:hover {
    background: rgba(51, 65, 85, 0.5);
    border-color: rgba(71, 85, 105, 0.5);
    transform: translateY(-2px);
  }
}

.quick-access-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
  
  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.quick-access-content {
  flex: 1;
  
  h4 {
    color: #f8fafc;
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }
  
  p {
    color: #94a3b8;
    font-size: 0.75rem;
    margin: 0;
  }
}

.quick-access-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  min-width: 1.25rem;
  text-align: center;
}

.error-section {
  margin-top: 1rem;
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.error-content {
  flex: 1;
}

.error-title {
  color: #fecaca;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.error-text {
  color: #fca5a5;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
}

.retry-button {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

// 响应式设计
@media (max-width: 768px) {
  .search-view {
    padding: 1rem;
  }
  
  .title-text {
    font-size: 2rem;
  }
  
  .search-box-container {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .quick-access-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .title-text {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-input {
    font-size: 1rem;
  }
  
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}</style>