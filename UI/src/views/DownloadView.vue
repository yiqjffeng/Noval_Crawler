<template>
  <div class="download-view">
    <div class="download-container">
      <div class="download-header">
        <BaseButton variant="ghost" @click="goBack">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          返回
        </BaseButton>
        <h1 class="download-title">下载配置</h1>
      </div>
      
      <div class="download-form">
        <BaseCard>
          <div class="form-section">
            <h3>基本设置</h3>
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
                size="large"
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
            <h3>下载进度</h3>
            <BaseProgress 
              :value="currentTask.percentage" 
              :show-text="true"
              size="large"
            />
            <div class="progress-info">
              <p>当前进度: {{ currentTask.current }} / {{ currentTask.total }}</p>
              <p>状态: {{ getStatusText(currentTask.status) }}</p>
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
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
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
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
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