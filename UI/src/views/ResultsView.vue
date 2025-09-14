<template>
  <div class="results-view">
    <!-- 页面头部 -->
    <div class="results-header">
      <div class="header-content">
        <!-- 返回按钮 -->
        <BaseButton
          variant="ghost"
          size="medium"
          @click="goBack"
          class="back-button"
        >
          <ArrowLeftIcon class="back-icon" />
          返回
        </BaseButton>
        
        <!-- 搜索信息 -->
        <div class="search-info">
          <h1 class="search-title">
            搜索结果：<span class="keyword">"{{ currentKeyword }}"</span>
          </h1>
          <p v-if="!isSearching" class="search-meta">
            找到 <strong>{{ searchResults.length }}</strong> 个结果
            <span v-if="searchTime" class="search-time">
              ({{ searchTime }}秒)
            </span>
          </p>
        </div>
        
        <!-- 搜索操作 -->
        <div class="search-actions">
          <!-- 新搜索按钮 -->
          <BaseButton
            variant="primary"
            size="medium"
            @click="showSearchBox = !showSearchBox"
            class="new-search-button"
          >
            <MagnifyingGlassIcon class="search-icon" />
            新搜索
          </BaseButton>
        </div>
      </div>
      
      <!-- 折叠的搜索框 -->
      <div v-if="showSearchBox" class="compact-search">
        <div class="search-input-wrapper">
          <input
            ref="searchInputRef"
            v-model="newSearchKeyword"
            type="text"
            class="search-input"
            placeholder="输入新的搜索关键词"
            @keydown.enter="handleNewSearch"
          />
          <BaseButton
            variant="primary"
            size="small"
            :loading="isSearching"
            :disabled="!newSearchKeyword.trim()"
            @click="handleNewSearch"
          >
            搜索
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- 搜索结果内容 -->
    <div class="results-content">
      <!-- 加载状态 -->
      <div v-if="isSearching" class="loading-section">
        <WizardLoader
          text="正在搜索小说..."
          :fullscreen="true"
          :show-progress="true"
          :progress="searchProgress"
        />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="hasError" class="error-section">
        <div class="error-message">
          <ExclamationTriangleIcon class="error-icon" />
          <div class="error-content">
            <h3 class="error-title">搜索出错了</h3>
            <p class="error-text">{{ errorState.error?.message }}</p>
            <div class="error-actions">
              <BaseButton
                variant="primary"
                size="medium"
                @click="retrySearch"
                class="retry-button"
              >
                重试搜索
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="medium"
                @click="goBack"
                class="back-button"
              >
                返回首页
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无结果状态 -->
      <div v-else-if="searchResults.length === 0" class="empty-section">
        <div class="empty-message">
          <BookOpenIcon class="empty-icon" />
          <h3 class="empty-title">没有找到相关小说</h3>
          <p class="empty-text">
            尝试使用不同的关键词，或检查拼写是否正确
          </p>
          <div class="empty-suggestions">
            <h4 class="suggestions-title">搜索建议：</h4>
            <ul class="suggestions-list">
              <li>使用更通用的关键词</li>
              <li>检查关键词拼写</li>
              <li>尝试使用作者名字</li>
              <li>使用小说的部分标题</li>
            </ul>
          </div>  
          <BaseButton
            variant="primary"
            size="medium"
            @click="showSearchBox = true"
            class="new-search-button"
          >
            重新搜索
          </BaseButton>
        </div>
      </div>
      
      <!-- 搜索结果列表 -->
      <div v-else class="results-list">
        <!-- 排序和筛选 -->
        <div class="results-controls">
          <div class="sort-options">
            <label class="sort-label">排序方式：</label>
            <select v-model="sortBy" @change="applySorting" class="sort-select">
              <option value="default">默认排序</option>
              <option value="title">按标题排序</option>
              <option value="author">按作者排序</option>
            </select>
          </div>
          
          <div class="view-options">
            <button
              :class="['view-button', { active: viewMode === 'grid' }]"
              @click="viewMode = 'grid'"
            >
              <Squares2X2Icon class="view-icon" />
              网格
            </button>
            <button
              :class="['view-button', { active: viewMode === 'list' }]"
              @click="viewMode = 'list'"
            >
              <ListBulletIcon class="view-icon" />
              列表
            </button>
          </div>
        </div>
        
        <!-- 结果网格/列表 -->
        <div 
          ref="resultsGridRef"
          :class="['results-grid', `results-${viewMode}`]"
        >
          <div
            v-for="(book, index) in displayedResults"
            :key="`${book.articlename}-${book.author}-${index}`"
            ref="bookCardRefs"
            class="book-card-wrapper"
          >
            <BaseCard
              :hoverable="true"
              :clickable="true"
              shadow="md"
              background="glass"
              @click="selectBook(book)"
              class="book-card"
            >
              <div class="book-content">
                <!-- 书籍封面 -->
                <div class="book-cover">
                  <img
                    :src="book.url_img"
                    :alt="book.articlename"
                    class="cover-image"
                    @error="handleImageError"
                    loading="lazy"
                  />
                  <div class="cover-overlay">
                    <EyeIcon class="view-icon" />
                  </div>
                </div>
                
                <!-- 书籍信息 -->
                <div class="book-info">
                  <h3 class="book-title" :title="book.articlename">
                    {{ book.articlename }}
                  </h3>
                  
                  <p class="book-author">
                    <UserIcon class="author-icon" />
                    {{ book.author }}
                  </p>
                  
                  <div class="book-intro" :title="book.intro">
                    {{ truncatedIntro(book.intro) }}
                  </div>
                  
                  <div class="book-actions">
                    <BaseButton
                      variant="primary"
                      size="small"
                      @click.stop="selectBook(book)"
                      class="view-button"
                    >
                      <BookOpenIcon class="action-icon" />
                      查看详情
                    </BaseButton>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
        
        <!-- 结果总数提示 -->
        <div v-if="displayedResults.length > 0" class="results-summary">
          已显示全部 {{ searchResults.length }} 条结果
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSearchStore, useBookStore } from '@/stores';
import { BaseButton, BaseCard } from '@/components/common';
import { WizardLoader } from '@/components/loading';
import { truncateText } from '@/utils/format';
import { staggerAnimation } from '@/utils/animation';

import type { BookItem } from '@/types';

// Icons
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  UserIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const route = useRoute();
const searchStore = useSearchStore();
const bookStore = useBookStore();

// 模板引用
const searchInputRef = ref<HTMLInputElement>();
const resultsGridRef = ref<HTMLElement>();
const bookCardRefs = ref<HTMLElement[]>([]);


// 响应式数据
const showSearchBox = ref(false);
const newSearchKeyword = ref('');
const viewMode = ref<'grid' | 'list'>('grid');
const sortBy = ref('default');
const searchTime = ref<number | null>(null);
const searchProgress = ref(0);

// 直接显示所有搜索结果，为每个结果添加索引信息
const displayedResults = computed(() => 
  searchResults.value.map((book, index) => ({
    ...book,
    index,
    searchKeyword: currentKeyword.value
  }))
);

// 计算属性
const currentKeyword = computed(() => searchStore.currentKeyword);
const searchResults = computed(() => searchStore.searchResults);
const isSearching = computed(() => searchStore.isSearching);
const hasError = computed(() => searchStore.hasError);
const errorState = computed(() => searchStore.errorState);

// 方法
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'Search' });
  }
};

const handleNewSearch = async () => {
  if (!newSearchKeyword.value.trim()) return;
  
  showSearchBox.value = false;
  const startTime = Date.now();
  
  // 模拟搜索进度
  const progressInterval = setInterval(() => {
    searchProgress.value = Math.min(searchProgress.value + Math.random() * 15, 90);
  }, 200);
  
  try {
    await searchStore.performSearch(newSearchKeyword.value);
    searchTime.value = (Date.now() - startTime) / 1000;
    searchProgress.value = 100;
    newSearchKeyword.value = '';
    
    // 重新动画显示结果
    nextTick(() => {
      animateResults();
    });
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    clearInterval(progressInterval);
    searchProgress.value = 0;
  }
};

const retrySearch = async () => {
  const startTime = Date.now();
  try {
    await searchStore.retrySearch();
    searchTime.value = (Date.now() - startTime) / 1000;
    

  } catch (error) {
    console.error('重试搜索失败:', error);
  }
};

const selectBook = (book: BookItem) => {
  // 设置增强的书籍信息，包含索引和搜索关键词
  const enhancedBook = {
    ...book,
    index: book.index || 0,
    searchKeyword: book.searchKeyword || currentKeyword.value
  };
  
  bookStore.setCurrentBook(enhancedBook);
  
  // 使用索引作为路由参数，确保索引从0开始
  router.push({ 
    name: 'BookDetail',
    params: { 
      id: (book.index !== undefined ? book.index : 0).toString()
    }
  });
};

const truncatedIntro = (intro: string): string => {
  return truncateText(intro, viewMode.value === 'grid' ? 100 : 200);
};

const applySorting = () => {
  let sortFn: (a: BookItem, b: BookItem) => number;
  
  switch (sortBy.value) {
    case 'title':
      sortFn = (a, b) => a.articlename.localeCompare(b.articlename);
      break;
    case 'author':
      sortFn = (a, b) => a.author.localeCompare(b.author);
      break;
    default:
      return; // 默认排序不需要处理
  }
  
  searchStore.sortResults(sortFn);
  
  // 重新动画
  nextTick(() => {
    animateResults();
  });
};



const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/src/assets/images/default-book-cover.jpg'; // 默认封面
};

const animateResults = () => {
  if (bookCardRefs.value.length > 0) {
    staggerAnimation(bookCardRefs.value, {
      duration: 0.6,
      stagger: 0.05,
      from: { opacity: 0, y: 30, scale: 0.9 },
      to: { opacity: 1, y: 0, scale: 1 }
    });
  }
};



// 生命周期
onMounted(async () => {
  const keyword = route.query.keyword as string;
  
  // 如果URL中有关键词但store中没有对应的搜索结果，执行搜索
  if (keyword && keyword !== currentKeyword.value) {
    const startTime = Date.now();
    try {
      await searchStore.performSearch(keyword);
      searchTime.value = (Date.now() - startTime) / 1000;
    } catch (error) {
      console.error('页面加载搜索失败:', error);
    }
  }
  
  // 初始化搜索结果
  if (searchResults.value.length > 0) {
    // 页面加载完成后播放动画
    nextTick(() => {
      animateResults();
    });
  }
  
  // 自动聚焦新搜索框
  watch(() => showSearchBox.value, (show) => {
    if (show) {
      nextTick(() => {
        searchInputRef.value?.focus();
      });
    }
  });
});

// 监听视图模式变化，重新播放动画
watch(() => viewMode.value, () => {
  nextTick(() => {
    animateResults();
  });
});
</script>

<style scoped lang="scss">
.results-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 1rem;
}

.results-header {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.back-button {
  flex-shrink: 0;
}

.back-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.search-info {
  flex: 1;
}

.search-title {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.keyword {
  color: #3b82f6;
}

.search-meta {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

.search-time {
  color: #64748b;
}

.search-actions {
  flex-shrink: 0;
}

.new-search-button {
  .search-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
}

.compact-search {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(51, 65, 85, 0.3);
}

.search-input-wrapper {
  display: flex;
  gap: 0.75rem;
  max-width: 400px;
}

.search-input {
  flex: 1;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: #f8fafc;
  font-size: 0.875rem;
  
  &::placeholder {
    color: #64748b;
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.results-content {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-section,
.error-section,
.empty-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.error-message,
.empty-message {
  text-align: center;
  max-width: 500px;
}

.error-icon,
.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #ef4444;
  margin: 0 auto 1rem auto;
}

.empty-icon {
  color: #64748b;
}

.error-title,
.empty-title {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.error-text,
.empty-text {
  color: #94a3b8;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.empty-suggestions {
  text-align: left;
  background: rgba(51, 65, 85, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
}

.suggestions-title {
  color: #f8fafc;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.suggestions-list {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
  padding-left: 1.25rem;
  
  li {
    margin-bottom: 0.25rem;
  }
}

.results-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.5rem;
  backdrop-filter: blur(4px);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

.sort-select {
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: #f8fafc;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.view-options {
  display: flex;
  gap: 0.25rem;
}

.view-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
    color: #93c5fd;
  }
  
  &.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
    color: #3b82f6;
  }
}

.view-icon {
  width: 1rem;
  height: 1rem;
}

.results-grid {
  display: grid;
  gap: 1.5rem;
  
  &.results-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  &.results-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.book-card {
  height: 100%;
  transition: all 0.3s ease-in-out;
  
  &:hover {
    transform: translateY(-4px);
  }
}

.book-content {
  display: flex;
  gap: 1rem;
  height: 100%;
  
  .results-grid & {
    flex-direction: column;
  }
  
  .results-list & {
    flex-direction: row;
  }
}

.book-cover {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  background: #334155;
  
  .results-grid & {
    aspect-ratio: 3/4;
    width: 100%;
  }
  
  .results-list & {
    width: 120px;
    height: 160px;
    flex-shrink: 0;
  }
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
  
  .book-card:hover & {
    transform: scale(1.05);
  }
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  
  .book-card:hover & {
    opacity: 1;
  }
}

.view-icon {
  width: 2rem;
  height: 2rem;
  color: white;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  color: #f8fafc;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  
  .results-grid & {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.book-author {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
}

.author-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.book-intro {
  color: #cbd5e1;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex: 1;
  
  .results-grid & {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.book-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
}

.view-button {
  flex: 1;
  
  .action-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
}

.results-summary {
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(51, 65, 85, 0.3);
  margin-top: 1rem;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 0.5rem;
}

// 响应式设计
@media (max-width: 768px) {
  .results-view {
    padding: 0.5rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .results-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .results-grid {
    &.results-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }
  }
  
  .book-content {
    .results-list & {
      flex-direction: column;
    }
  }
  
  .book-cover {
    .results-list & {
      width: 100%;
      height: 200px;
    }
  }
}

@media (max-width: 480px) {
  .search-title {
    font-size: 1.25rem;
  }
  
  .results-grid {
    &.results-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style>