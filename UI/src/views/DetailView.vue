<template>
  <div class="detail-view">
    <div class="detail-container">
      <div class="detail-header">
        <BaseButton variant="ghost" @click="goBack">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          返回
        </BaseButton>
        <h1 class="detail-title">书籍详情</h1>
      </div>
      
      <LoadingSpinner v-if="isLoadingCatalog" text="正在加载目录..." />
      
      <div v-else-if="currentBook" class="book-detail">
        <div class="book-header">
          <img :src="currentBook.url_img" :alt="currentBook.articlename" class="book-cover" />
          <div class="book-info">
            <h2 class="book-title">{{ currentBook.articlename }}</h2>
            <p class="book-author">作者：{{ currentBook.author }}</p>
            <p class="book-intro">{{ currentBook.intro }}</p>
            <div class="book-actions">
              <BaseButton variant="primary" @click="startDownload">
                下载小说
              </BaseButton>
            </div>
          </div>
        </div>
        
        <div v-if="bookCatalog" class="catalog-section">
          <div class="catalog-header">
            <h3>目录 ({{ chapterCount }} 章)</h3>
            
            <!-- 章节导航 -->
            <div class="chapter-nav">
              <div class="nav-info">
                共 {{ chapterCount }} 章
              </div>
              <div class="nav-jump">
                <input 
                  v-model.number="jumpTarget"
                  type="number" 
                  :min="1" 
                  :max="chapterCount"
                  placeholder="跳转到章节"
                  @keydown.enter="jumpToChapter"
                  class="jump-input"
                />
                <BaseButton @click="jumpToChapter" size="small">
                  跳转
                </BaseButton>
              </div>
            </div>
          </div>
          
          <!-- 虚拟滚动目录列表 -->
          <div 
            ref="scrollContainer"
            class="chapter-scroll-container"
            :style="containerStyle"
            @scroll="handleScroll"
          >
            <!-- 占位空间 -->
            <div :style="{ height: totalHeight + 'px', position: 'relative' }">
              <!-- 可见章节 -->
              <div :style="offsetStyle">
                <div
                  v-for="(chapter, index) in visibleChapters"
                  :key="chapter.url"
                  class="chapter-item"
                  :style="getItemStyle(index)"
                  @click="selectChapter(chapter, startIndex + index)"
                >
                  <span class="chapter-number">
                    {{ startIndex + index + 1 }}
                  </span>
                  <span class="chapter-title">
                    {{ chapter.title }}
                  </span>
                  <span class="chapter-action">
                    <EyeIcon class="action-icon" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/stores';
import { BaseButton } from '@/components/common';
import { LoadingSpinner } from '@/components/loading';
import { useChapterVirtualScroll } from '@/composables';
import type { Chapter } from '@/types';
import { ArrowLeftIcon, EyeIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const bookStore = useBookStore();

// 模板引用
const scrollContainer = ref<HTMLElement>();
const jumpTarget = ref<number>();

// 计算属性
const currentBook = computed(() => bookStore.currentBook);
const bookCatalog = computed(() => bookStore.bookCatalog);
const isLoadingCatalog = computed(() => bookStore.isLoadingCatalog);
const chapterCount = computed(() => bookStore.chapterCount);

// 章节数据
const chapters = computed(() => bookCatalog.value?.chapters || []);

// 虚拟滚动
const {
  visibleItems: visibleChapters,
  containerStyle,
  offsetStyle,
  totalHeight,
  startIndex,
  endIndex,
  handleScroll,
  getItemStyle,
  jumpToChapter: virtualJumpToChapter
} = useChapterVirtualScroll(chapters, {
  itemHeight: 48,
  containerHeight: 500,
  buffer: 10
});

// 方法
const goBack = () => {
  router.go(-1);
};

const startDownload = () => {
  router.push({ name: 'Download' });
};

const selectChapter = (chapter: Chapter, index: number) => {
  console.log(`选择章节: ${chapter.title} (索引: ${index})`);
  // 这里可以添加跳转到阅读页面的逻辑
};

const jumpToChapter = () => {
  if (jumpTarget.value && scrollContainer.value) {
    virtualJumpToChapter(jumpTarget.value, scrollContainer.value);
  }
};

onMounted(async () => {
  if (currentBook.value && !bookCatalog.value) {
    await bookStore.loadBookCatalog(1); // 简化版，使用固定ID
  }
});
</script>

<style scoped>
.detail-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 1rem;
}

.detail-container {
  max-width: 1000px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-title {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.book-detail {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 0.75rem;
  padding: 2rem;
  backdrop-filter: blur(8px);
}

.book-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.book-cover {
  width: 200px;
  height: 260px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.book-info {
  flex: 1;
}

.book-title {
  color: #f8fafc;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.book-author {
  color: #94a3b8;
  font-size: 1.125rem;
  margin: 0 0 1rem 0;
}

.book-intro {
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.book-actions {
  display: flex;
  gap: 1rem;
}

.catalog-section {
  margin-top: 2rem;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
  padding-top: 2rem;
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.catalog-section h3 {
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.chapter-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-info {
  color: #94a3b8;
  font-size: 0.875rem;
}

.nav-jump {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jump-input {
  width: 120px;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
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

.chapter-scroll-container {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.5rem;
  overflow-y: auto;
  
  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(51, 65, 85, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.6);
    border-radius: 4px;
    
    &:hover {
      background: rgba(100, 116, 139, 0.8);
    }
  }
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #93c5fd;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.chapter-number {
  flex-shrink: 0;
  width: 3rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: right;
}

.chapter-title {
  flex: 1;
  color: #cbd5e1;
  font-size: 0.875rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-action {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  
  .chapter-item:hover & {
    opacity: 1;
  }
}

.action-icon {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
}
</style>