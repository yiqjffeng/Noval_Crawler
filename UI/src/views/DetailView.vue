<template>
  <div class="detail-view">
    <div class="detail-container">
      <div class="detail-header">
        <BaseButton variant="ghost"
                    size="medium"
                    @click="goBack">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          返回
        </BaseButton>
        <h1 class="detail-title">书籍详情</h1>
      </div>

      <!-- 错误状态 -->
      <div v-if="errorState.hasError" class="error-section">
        <div class="error-message">
          <div class="error-icon">
            <ExclamationTriangleIcon class="w-12 h-12 text-amber-500" />
          </div>
          <div class="error-content">
            <h3 class="error-title">无法加载书籍详情</h3>
            <p class="error-text">{{ errorState.errorMessage }}</p>

            <!-- 根据错误类型显示不同的建议 -->
            <div class="error-suggestions" v-if="errorState.errorType === 'data_missing'">
              <p class="suggestions-title">可能的解决方案：</p>
              <ul class="suggestions-list">
                <li>返回搜索页面重新选择书籍</li>
                <li>检查浏览器是否禁用了本地存储</li>
                <li>尝试刷新页面</li>
              </ul>
            </div>

            <div class="error-suggestions" v-else-if="errorState.errorType === 'catalog_load_error'">
              <p class="suggestions-title">可能的解决方案：</p>
              <ul class="suggestions-list">
                <li>检查网络连接是否正常</li>
                <li>确认后端服务正在运行</li>
                <li>尝试重新加载</li>
              </ul>
            </div>

            <div class="error-suggestions" v-else-if="errorState.errorType === 'invalid_data'">
              <p class="suggestions-title">可能的解决方案：</p>
              <ul class="suggestions-list">
                <li>返回搜索页面重新选择书籍</li>
                <li>检查书籍信息是否完整</li>
                <li>尝试刷新页面</li>
              </ul>
            </div>

            <div class="error-actions">
              <BaseButton
                variant="primary"
                @click="retryLoadData"
                :loading="isLoadingCatalog"
              >
                重新加载
              </BaseButton>
              <BaseButton variant="ghost" @click="goToSearch">
                返回搜索
              </BaseButton>
              <BaseButton variant="ghost" @click="goBack">
                返回上页
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <WizardLoader v-else-if="isLoadingCatalog" text="正在加载目录..." :fullscreen="false" />

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

          <!-- 章节列表 -->
          <div class="chapter-scroll-container" ref="scrollContainer">
            <ChapterLink
              v-for="(chapter, index) in chapters"
              :key="chapter.url"
              :chapter="chapter"
              :chapter-index="index"
              :base-url="getBaseUrl()"
              @chapter-click="handleChapterClick"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBookStore, useSearchStore } from '@/stores';
import { BaseButton } from '@/components/common';
import { WizardLoader } from '@/components/loading';
import ChapterLink from '@/components/ChapterLink.vue';
import type { Chapter, ErrorState } from '@/types';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const route = useRoute();
const bookStore = useBookStore();
const searchStore = useSearchStore();

// 模板引用
const scrollContainer = ref<HTMLElement>();
const jumpTarget = ref<number>();

// 错误状态
const errorState = reactive({
  hasError: false,
  errorMessage: '',
  errorType: 'unknown'
});

// 路由参数
const bookId = computed(() => {
  const id = parseInt(route.params.id as string);
  return isNaN(id) ? 0 : id;
});

// 计算属性
const currentBook = computed(() => bookStore.currentBook);
const bookCatalog = computed(() => bookStore.bookCatalog);
const isLoadingCatalog = computed(() => bookStore.isLoadingCatalog);
const chapterCount = computed(() => bookStore.chapterCount);

// 章节数据
const chapters = computed(() => bookCatalog.value?.chapters || []);

// 章节数据完整性检查
const validateChapterData = (catalog: any): boolean => {
  if (!catalog?.chapters || !Array.isArray(catalog.chapters)) {
    console.error('章节数据格式错误');
    return false;
  }

  const expectedCount = catalog.novel_info?.total_chapters || 0;
  const actualCount = catalog.chapters.length;

  if (expectedCount > 0 && expectedCount !== actualCount) {
    console.warn(`章节数量不匹配: 预期${expectedCount}, 实际${actualCount}`);
  }

  return catalog.chapters.length > 0;
};

// 书籍数据验证
const validateBookData = (book: any): boolean => {
  if (!book) {
    console.error('书籍数据为空');
    return false;
  }

  const requiredFields = ['articlename', 'author', 'url_list'];
  for (const field of requiredFields) {
    if (!book[field]) {
      console.error(`书籍数据缺少必要字段: ${field}`);
      return false;
    }
  }

  return true;
};
// 数据恢复机制优化
const restoreBookFromId = async (id: number): Promise<boolean> => {
  try {
    console.log(`尝试恢复书籍数据，前端ID: ${id}`);

    // 策略1: 从缓存恢复
    const cacheResult = bookStore.restoreBookFromCache();
    if (cacheResult.success && cacheResult.data) {
      console.log('从缓存恢复书籍信息成功');
      // 验证索引是否匹配
      const cachedId = cacheResult.data.index ?? parseInt((cacheResult.data as any).novel_id || '0');
      if (cachedId === id) {
        return true;
      } else {
        console.warn(`缓存的书籍ID(${cachedId})与当前ID(${id})不匹配`);
      }
    }

    // 策略2: 从搜索结果恢复
    let searchResult = searchStore.findBookById(id);
    if (!searchResult) {
      // 策略3: 尝试恢复搜索结果后再查找
      console.log('从内存中未找到，尝试恢复搜索结果...');
      const restored = searchStore.restoreSearchResults();
      if (restored) {
        console.log('搜索结果恢复成功，重新查找书籍');
        searchResult = searchStore.findBookById(id);
      }
    }

    if (searchResult) {
      const bookWithIndex = {
        ...searchResult,
        index: id,
        searchKeyword: searchStore.currentKeyword
      };

      bookStore.setCurrentBook(bookWithIndex);
      console.log('从搜索结果恢复书籍信息成功');
      return true;
    }

    console.warn('所有恢复策略都失败了');
    return false;
  } catch (error) {
    console.error('数据恢复失败:', error);
    return false;
  }
};

// 设置错误状态
const setError = (message: string, type: 'data_missing' | 'catalog_load_error' | 'invalid_data' | 'unknown' = 'unknown') => {
  errorState.hasError = true
  errorState.errorMessage = message
  errorState.errorType = type
};

// 清除错误状态
const clearError = () => {
  errorState.hasError = false
  errorState.errorMessage = ''
  errorState.errorType = 'unknown'
};

// 重试机制
const retryLoadData = async () => {
  console.log('用户触发重试加载');
  clearError();

  // 重新尝试数据恢复
  const restored = await restoreBookFromId(bookId.value);
  if (!restored) {
    setError('数据恢复失败，请返回搜索页面重新选择书籍', 'data_missing');
    return;
  }

  // 重新加载目录
  try {
    const apiNovelId = bookId.value + 1;
    await bookStore.loadBookCatalog(apiNovelId);
    console.log('重试加载成功');
  } catch (error) {
    console.error('重试加载失败:', error);
    setError('目录加载失败，请重试', 'catalog_load_error');
  }
};

const goToSearch = () => {
  router.push({ name: 'Search' });
};

const startDownload = () => {
  router.push({ name: 'Download' });
};

const selectChapter = (chapter: Chapter, index: number) => {
  console.log(`选择章节: ${chapter.title} (索引: ${index})`);
  // 这里可以添加跳转到阅读页面的逻辑
};

const handleChapterClick = (chapter: Chapter, index: number) => {
  console.log(`点击章节: ${chapter.title} (索引: ${index})`);

  // 跳转到章节阅读页面
  router.push({
    name: 'ChapterRead',
    params: {
      bookId: currentBook.value?.articlename || 'unknown',
      chapterId: (index + 1).toString()
    }
  });
};

const getBaseUrl = (): string => {
  // 从当前书籍信息中获取域名
  if (bookCatalog.value?.novel_info?.domain) {
    return `https://${bookCatalog.value.novel_info.domain}`;
  }
  // 默认域名（根据项目配置）
  return 'https://www.xbiquge.la';
};

const jumpToChapter = () => {
  if (jumpTarget.value && scrollContainer.value) {
    const targetIndex = jumpTarget.value - 1; // 转换为0-based索引
    if (targetIndex >= 0 && targetIndex < chapters.value.length) {
      // 获取目标章节元素（使用正确的类名）
      const chapterElements = scrollContainer.value.querySelectorAll('.chapter-link-wrapper');
      if (chapterElements[targetIndex]) {
        // 平滑滚动到目标章节
        chapterElements[targetIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // 高亮显示目标章节
        const chapterLink = chapterElements[targetIndex].querySelector('.chapter-link');
        if (chapterLink) {
          chapterLink.classList.add('highlighted');
          setTimeout(() => {
            chapterLink.classList.remove('highlighted');
          }, 2000);
        }
      }
    }
  }
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'Search' });
  }
};

// 生命周期钩子 - 页面加载时的初始化逻辑
onMounted(async () => {
  console.log('DetailView页面加载，bookId:', bookId.value);
  clearError();

  // 检查是否有当前书籍信息
  if (!currentBook.value) {
    console.log('没有当前书籍信息，尝试恢复数据...');

    // 尝试恢复书籍数据
    const restored = await restoreBookFromId(bookId.value);
    if (!restored) {
      console.error('无法恢复书籍数据');
      setError('书籍信息丢失，请返回搜索页面重新选择书籍', 'data_missing');
      return;
    }
  }

  // 验证书籍数据完整性
  if (!validateBookData(currentBook.value)) {
    console.error('书籍数据不完整');
    setError('书籍数据异常，请重新选择', 'invalid_data');
    return;
  }

  // 如果已有目录数据且数据有效，不需要重新加载
  if (bookCatalog.value && validateChapterData(bookCatalog.value)) {
    console.log('目录数据已存在且有效，跳过加载');
    return;
  }

  // 加载目录
  try {
    console.log('开始加载目录...');
    const apiNovelId = bookId.value + 1; // 前端索引从0开始，API从1开始
    console.log(`调用API加载目录，novel_id: ${apiNovelId}`);
    await bookStore.loadBookCatalog(apiNovelId);
    console.log('目录加载完成');
  } catch (error) {
    console.error('目录加载失败:', error);
    setError('目录加载失败，请重试', 'catalog_load_error');
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
  max-height: none; /* 移除高度限制，显示所有章节 */

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

/* 章节项样式 */
.chapter-item:hover {
  background: rgba(71, 85, 105, 0.5);
  border-left-color: #3b82f6;
  transform: translateX(2px);
}

.chapter-item.highlighted {
  background: rgba(59, 130, 246, 0.3);
  border-left-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-item a {
  color: inherit;
  text-decoration: none;
  display: block;
  padding: 1rem;
  width: 100%;
  height: 100%;
}

.chapter-item .chapter-title {
  color: #f8fafc;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
}

.chapter-item .chapter-number {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
  min-width: 3rem;
  text-align: right;
}



/* 错误状态样式 */
.error-section {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.75rem;
  padding: 2rem;
  margin: 2rem 0;
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.error-icon {
  flex-shrink: 0;
  padding: 0.5rem;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 50%;
}

.error-content {
  flex: 1;
}

.error-title {
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.error-text {
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.error-suggestions {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;
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
    line-height: 1.5;
  }
}

.error-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}


</style>
