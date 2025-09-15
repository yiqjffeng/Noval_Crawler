<template>
  <div class="chapter-read-view">
    <div class="read-container">
      <!-- 页面头部 -->
      <div class="read-header">
        <div class="header-left">
          <BaseButton @click="goBack" size="medium" variant="ghost">
            <ArrowLeftIcon />
            返回目录
          </BaseButton>
        </div>

        <div class="chapter-info">
          <h1 class="chapter-title">{{ currentChapter?.title || '加载中...' }}</h1>
          <p class="book-info">
            <span v-if="bookInfo">{{ bookInfo.novel_title }} - {{ bookInfo.author }}</span>
          </p>
        </div>

        <div class="header-right">
          <BaseButton @click="openOriginalUrl" variant="primary" size="medium" :disabled="!chapterUrl">
            <ArrowTopRightOnSquareIcon />
            原网站阅读
          </BaseButton>
        </div>
      </div>

      <!-- 章节导航 -->
      <div class="chapter-navigation">
        <BaseButton
          @click="previousChapter"
          :disabled="!hasPreviousChapter"
          size="medium"
          variant="ghost"
        >
          <ChevronLeftIcon />
          上一章
        </BaseButton>

        <div class="nav-info">
          <span class="chapter-number">第 {{ currentChapterIndex + 1 }} 章</span>
          <span class="total-chapters">共 {{ totalChapters }} 章</span>
        </div>

        <BaseButton
          @click="nextChapter"
          :disabled="!hasNextChapter"
          variant="ghost"
          size="medium"
        >
          下一章
          <ChevronRightIcon />
        </BaseButton>
      </div>

      <!-- 阅读内容区域 -->
      <div class="read-content">
        <div class="content-placeholder">
          <div class="placeholder-icon">
            <BookOpenIcon class="icon" />
          </div>

          <h3 class="placeholder-title">点击"原网站阅读"开始阅读</h3>

          <div class="placeholder-info">
            <p>由于版权保护，我们不提供章节内容的直接显示。</p>
            <p>请点击下方的"原网站阅读"按钮前往原始网站阅读此章节。</p>
          </div>

          <div class="chapter-details" v-if="currentChapter">
            <div class="detail-item">
              <span class="label">章节标题：</span>
              <span class="value">{{ currentChapter.title }}</span>
            </div>
            <div class="detail-item" v-if="chapterUrl">
              <span class="label">章节链接：</span>
              <div class="url-container">
                <span class="url-text">{{ chapterUrl }}</span>
                <BaseButton @click="copyChapterUrl" size="medium" variant="ghost">
                  <ClipboardDocumentIcon />
                </BaseButton>
              </div>
            </div>
          </div>

          <div class="reading-actions">
            <BaseButton
              @click="openOriginalUrl"
              variant="primary"
              size="medium"
              :disabled="!chapterUrl"
            >
              <ArrowTopRightOnSquareIcon />
              原网站阅读
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- 底部导航 -->
      <div class="bottom-navigation">
        <BaseButton
          @click="previousChapter"
          :disabled="!hasPreviousChapter"
          size="medium"
          variant="secondary"
        >
          <ChevronLeftIcon />
          上一章
        </BaseButton>

        <BaseButton @click="goBackToCatalog" size="medium" variant="ghost">
          目录
        </BaseButton>

        <BaseButton
          @click="nextChapter"
          :disabled="!hasNextChapter"
          variant="secondary"
          size="medium"
        >
          下一章
          <ChevronRightIcon />
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBookStore } from '@/stores';
import { BaseButton } from '@/components/common';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const route = useRoute();
const bookStore = useBookStore();

// 响应式数据
const isLoading = ref(false);
const error = ref<string | null>(null);

// 计算属性
const bookCatalog = computed(() => bookStore.bookCatalog);
const bookInfo = computed(() => bookStore.bookInfo);
const currentChapterIndex = computed(() => {
  const chapterId = route.params.chapterId;
  return typeof chapterId === 'string' ? parseInt(chapterId) - 1 : 0;
});

const totalChapters = computed(() => bookStore.chapterCount);

const currentChapter = computed(() => {
  if (!bookCatalog.value || currentChapterIndex.value < 0) {
    return null;
  }
  return bookCatalog.value.chapters[currentChapterIndex.value] || null;
});

const chapterUrl = computed(() => {
  if (!currentChapter.value || !bookInfo.value?.domain) {
    return null;
  }
  return `https://${bookInfo.value.domain}${currentChapter.value.url}`;
});

const hasPreviousChapter = computed(() => currentChapterIndex.value > 0);

const hasNextChapter = computed(() =>
  currentChapterIndex.value < totalChapters.value - 1
);

// 方法
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'Search' });
  }
};

const goBackToCatalog = () => {
  router.push({ name: 'BookDetail' });
};

const openOriginalUrl = () => {
  if (chapterUrl.value) {
    window.open(chapterUrl.value, '_blank');
  }
};

const copyChapterUrl = async () => {
  if (!chapterUrl.value) return;

  try {
    await navigator.clipboard.writeText(chapterUrl.value);
    console.log('章节链接已复制到剪贴板');
  } catch (error) {
    console.error('复制链接失败:', error);
    fallbackCopyTextToClipboard(chapterUrl.value);
  }
};

const fallbackCopyTextToClipboard = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    console.log('链接已复制（降级方案）');
  } catch (error) {
    console.error('复制失败:', error);
  }

  document.body.removeChild(textArea);
};

const previousChapter = () => {
  if (hasPreviousChapter.value) {
    const prevChapterIndex = currentChapterIndex.value;
    router.push({
      name: 'ChapterRead',
      params: {
        bookId: route.params.bookId,
        chapterId: prevChapterIndex.toString()
      }
    });
  }
};

const nextChapter = () => {
  if (hasNextChapter.value) {
    const nextChapterIndex = currentChapterIndex.value + 2;
    router.push({
      name: 'ChapterRead',
      params: {
        bookId: route.params.bookId,
        chapterId: nextChapterIndex.toString()
      }
    });
  }
};

// 生命周期
onMounted(async () => {
  if (!bookCatalog.value) {
    isLoading.value = true;
    try {
      await bookStore.loadBookCatalog(1);
    } catch (err) {
      error.value = '加载章节信息失败';
      console.error('加载目录失败:', err);
    } finally {
      isLoading.value = false;
    }
  }
});

watch(() => route.params.chapterId, (newChapterId) => {
  if (newChapterId) {
    console.log(`切换到章节: ${newChapterId}`);
  }
});
</script>

<!-- 使用全局 BaseButton 组件 -->
<script lang="ts">
// 移除内部 BaseButton 定义，使用全局组件
</script>

<style scoped>
.chapter-read-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 1rem;
}

.read-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


.read-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 0.75rem;
  padding: 1rem;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(51, 65, 85, 0.5);
}

.header-left,
.header-right {
  flex-shrink: 0;
}

.chapter-info {
  flex: 1;
  text-align: center;
  margin: 0 2rem;
}

.chapter-title {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.book-info {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

.chapter-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(51, 65, 85, 0.3);
}

.nav-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.chapter-number {
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
}

.total-chapters {
  color: #64748b;
  font-size: 0.75rem;
}

.read-content {
  flex: 1;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 0.75rem;
  padding: 2rem;
  border: 1px solid rgba(51, 65, 85, 0.5);
  backdrop-filter: blur(8px);
}

.content-placeholder {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.placeholder-icon {
  margin-bottom: 1.5rem;
}

.icon {
  width: 4rem;
  height: 4rem;
  color: #64748b;
  margin: 0 auto;
}

.placeholder-title {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.placeholder-info {
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.placeholder-info p {
  margin: 0 0 0.5rem 0;
}

.chapter-details {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.value {
  color: #f8fafc;
  font-size: 0.875rem;
  flex: 1;
}

.url-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.url-text {
  color: #3b82f6;
  font-size: 0.875rem;
  word-break: break-all;
  flex: 1;
}

.reading-actions {
  margin-top: 2rem;
}

.bottom-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(51, 65, 85, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .read-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .chapter-info {
    margin: 0;
  }

  .chapter-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .bottom-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .detail-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .url-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .chapter-read-view {
    padding: 0.5rem;
  }

  .read-container {
    gap: 1rem;
  }

  .read-header,
  .read-content {
    padding: 1rem;
  }

  .chapter-title {
    font-size: 1.25rem;
  }
}
</style>
