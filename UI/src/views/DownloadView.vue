<template>
  <div class="download-view">
    <div class="download-container">
      <div class="download-header">
        <div class="header-nav">
          <BaseButton variant="ghost" size="medium" @click="goBack" class="back-button">
            <ArrowLeftIcon class="back-icon" />
            返回上页
          </BaseButton>
          <BaseButton variant="primary" size="medium" @click="goToSearch" class="search-button" style="margin-left: auto;">
            <MagnifyingGlassIcon class="search-icon" />
            返回搜索
          </BaseButton>
        </div>
        <h1 class="download-title">下载配置</h1>
      </div>
      
      <div class="download-form">
        <BaseCard>
          <div class="form-section">
            <h3>{{ currentBook?.articlename || '书籍下载' }}</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>文件格式</label>
                <select v-model="downloadConfig.format" class="form-select">
                  <option value="txt">TXT</option>
                  <option value="epub">EPUB</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>起始章节</label>
                <input 
                  v-model.number="downloadConfig.startChapter" 
                  type="number" 
                  min="1"
                  :max="maxChapter"
                  class="form-input"
                  :class="{ 'input-error': isStartChapterInvalid }"
                  @input="validateStartChapter"
                />
                <span v-if="isStartChapterInvalid" class="error-message">
                  请输入1-{{ maxChapter }}之间的章节
                </span>
              </div>
              
              <div class="form-group">
                <label>结束章节</label>
                <input 
                  v-model.number="downloadConfig.endChapter" 
                  type="number" 
                  min="1"
                  :max="maxChapter"
                  class="form-input"
                  :class="{ 'input-error': isEndChapterInvalid }"
                  @input="validateEndChapter"
                />
                <span class="chapter-info">最大章节: {{ maxChapter }}</span>
                <span v-if="isRangeInvalid && !isStartChapterInvalid && !isEndChapterInvalid" class="error-message">
                  结束章节必须大于等于起始章节
                </span>
              </div>
              
              <div class="form-group">
                <label>文件名</label>
                <input 
                  v-model="downloadConfig.fileName" 
                  type="text"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-actions">
              <BaseButton 
                variant="primary" 
                size="medium"
                :loading="isDownloading"
                :disabled="isStartChapterInvalid || isEndChapterInvalid || isRangeInvalid"
                @click="startDownload"
              >
                开始下载
              </BaseButton>
            </div>
          </div>
        </BaseCard>
        
        <!-- 下载进度 -->
        <div v-if="currentTask" class="progress-section">
          <BaseCard>
            <div class="progress-header">
              <h3>下载进度</h3>
              <div class="book-info">
                <BookOpenIcon class="book-icon" />
                <span class="book-name">{{ currentTask.book_name || downloadConfig.fileName }}</span>
              </div>
            </div>
            <BaseProgress 
              :value="getTaskProgress(currentTask)" 
              :show-text="true"
              size="medium"
              :variant="getProgressVariant(currentTask.status)"
            />
            <div class="progress-info">
              <p>当前进度: {{ currentTask.current }} / {{ currentTask.total }}</p>
              <p>状态: {{ getStatusText(currentTask.status) }}</p>
              <p v-if="currentTask.failed_chapters.length > 0">
                失败章节: {{ currentTask.failed_chapters.length }} 个
              </p>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDownloadStore, useBookStore } from '@/stores';
import { BaseButton, BaseCard, BaseProgress } from '@/components/common';
import { ArrowLeftIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/vue/24/outline';
import type { DownloadTaskStatus } from '@/types';

const router = useRouter();
const downloadStore = useDownloadStore();
const bookStore = useBookStore();

const downloadConfig = computed(() => downloadStore.downloadConfig);
const isDownloading = computed(() => downloadStore.isDownloading); 
const currentTask = computed(() => downloadStore.currentTask);
const currentBook = computed(() => bookStore.currentBook);
const maxChapter = computed(() => bookStore.chapterCount || 999999);

// 验证状态
const isStartChapterInvalid = ref(false);
const isEndChapterInvalid = ref(false);
const isRangeInvalid = ref(false);

// 实时验证函数
const validateStartChapter = () => {
  const start = downloadConfig.value.startChapter;
  isStartChapterInvalid.value = start < 1 || start > maxChapter.value;
  validateRange();
};

const validateEndChapter = () => {
  const end = downloadConfig.value.endChapter;
  isEndChapterInvalid.value = end < 1 || end > maxChapter.value;
  validateRange();
};

const validateRange = () => {
  if (isStartChapterInvalid.value || isEndChapterInvalid.value) {
    isRangeInvalid.value = false;
    return;
  }
  isRangeInvalid.value = downloadConfig.value.endChapter < downloadConfig.value.startChapter;
};

const goBack = () => {
  // 优先使用浏览器历史记录
  if (window.history.length > 1) {
    router.back();
    return;
  }
  
  // 如果有当前书籍，返回详情页
  if (currentBook.value?.index) {
    router.push({ name: 'BookDetail', params: { id: currentBook.value.index } });
    return;
  }
  
  // 默认返回搜索页
  router.push({ name: 'Search' });
};

// 直接返回搜索页
const goToSearch = () => {
  router.push({ name: 'Search' });
};

const startDownload = async () => {
  if (!currentBook.value) return;
  
  // 最终验证
  validateStartChapter();
  validateEndChapter();
  validateRange();
  
  // 如果有错误，提示用户
  if (isStartChapterInvalid.value || isEndChapterInvalid.value || isRangeInvalid.value) {
    return;
  }
  
  const params = {
    novel_url: currentBook.value.url_list,
    book_name: currentBook.value.articlename,
    start_chapter: downloadConfig.value.startChapter,
    end_chapter: downloadConfig.value.endChapter,
    mode: downloadConfig.value.format
  };
  
  await downloadStore.startDownload(params);
};

// 计算任务进度百分比
const getTaskProgress = (task: any): number => {
  if (task.status === 'completed') {
    return 100;
  }
  
  if (task.percentage > 0) {
    return Math.min(task.percentage, 100);
  }
  
  if (task.current > 0 && task.total > 0) {
    return Math.min(Math.round((task.current / task.total) * 100), 100);
  }
  
  return 0;
};

// 进度条颜色变体
const getProgressVariant = (status: DownloadTaskStatus): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  const variantMap: Record<DownloadTaskStatus, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    'completed': 'success',
    'running': 'primary', 
    'failed': 'error',
    'stopped': 'warning',
    'pending': 'info',
    'paused': 'warning'
  };
  return variantMap[status] || 'primary';
};

const getStatusText = (status: DownloadTaskStatus): string => {
  const statusMap = {
    pending: '等待中',
    running: '下载中', 
    completed: '已完成',
    failed: '失败',
    stopped: '已停止',
    paused: '已暂停'
  };
  return statusMap[status] || '未知';
};

onMounted(() => {
  if (currentBook.value) {
    downloadStore.updateDownloadConfig({
      fileName: currentBook.value.articlename,
      startChapter: 1,
      endChapter: maxChapter.value
    });
  }
});

// 监听maxChapter变化，自动调整超出范围的值
watch(maxChapter, (newMaxChapter) => {
  if (newMaxChapter > 0) {
    const currentStart = downloadConfig.value.startChapter;
    const currentEnd = downloadConfig.value.endChapter;
    
    let newStart = currentStart;
    let newEnd = currentEnd;
    
    if (currentStart > newMaxChapter) {
      newStart = newMaxChapter;
    }
    if (currentEnd > newMaxChapter) {
      newEnd = newMaxChapter;
    }
    
    downloadStore.updateDownloadConfig({
      startChapter: newStart,
      endChapter: newEnd
    });
    
    // 重新验证
    validateStartChapter();
    validateEndChapter();
    validateRange();
  }
});
</script>

<style scoped>
.download-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 1rem;
}

.download-container {
  max-width: 800px;
  margin: 0 auto;
}

.download-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  flex-shrink: 0;
}

.back-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.search-button {
  flex-shrink: 0;
}

.search-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.download-title {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.download-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section h3 {
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-input,
.form-select {
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #f8fafc;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: center;
}

.progress-section h3 {
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.progress-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.progress-header h3 {
  margin: 0;
}

.book-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 0.5rem;
  border-left: 3px solid #3b82f6;
}

.book-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.book-name {
  color: #f8fafc;
  font-weight: 500;
  font-size: 0.875rem;
}

.progress-info {
  margin-top: 1rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.progress-info p {
  margin: 0.25rem 0;
}

.chapter-info {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.input-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}
</style>