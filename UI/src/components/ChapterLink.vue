<template>
  <div class="chapter-link-wrapper">
    <a 
      :href="chapterUrl"
      :title="`阅读: ${chapter.title}`"
      class="chapter-link"
      @click="handleChapterClick"
      @contextmenu="handleRightClick"
    >
      <span class="chapter-number">{{ chapterIndex + 1 }}</span>
      <span class="chapter-title">{{ chapter.title }}</span>
      <span class="chapter-actions">
        <EyeIcon class="action-icon" />
        <ArrowTopRightOnSquareIcon class="external-icon" />
      </span>
    </a>
    
    <!-- 右键菜单 -->
    <div 
      v-if="showContextMenu"
      ref="contextMenuRef"
      class="context-menu"
      :style="contextMenuStyle"
      @click.stop
    >
      <button @click="openInNewTab" class="menu-item">
        <ArrowTopRightOnSquareIcon class="menu-icon" />
        新标签页打开
      </button>
      <button @click="copyChapterUrl" class="menu-item">
        <ClipboardDocumentIcon class="menu-icon" />
        复制链接
      </button>
      <button @click="closeContextMenu" class="menu-item">
        <XMarkIcon class="menu-icon" />
        关闭菜单
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  EyeIcon, 
  ArrowTopRightOnSquareIcon, 
  ClipboardDocumentIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/outline';
import type { Chapter } from '@/types';

interface Props {
  chapter: Chapter;
  chapterIndex: number;
  baseUrl: string;
}

interface Emits {
  (e: 'chapter-click', chapter: Chapter, index: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 状态
const showContextMenu = ref(false);
const contextMenuRef = ref<HTMLElement>();
const contextMenuStyle = ref({});

// 计算属性
const chapterUrl = computed(() => {
  return `${props.baseUrl}${props.chapter.url}`;
});

// 方法
const handleChapterClick = (event: MouseEvent) => {
  event.preventDefault();
  emit('chapter-click', props.chapter, props.chapterIndex);
};

const handleRightClick = (event: MouseEvent) => {
  event.preventDefault();
  
  const { clientX, clientY } = event;
  contextMenuStyle.value = {
    position: 'fixed',
    top: `${clientY}px`,
    left: `${clientX}px`,
    zIndex: '1000'
  };
  
  showContextMenu.value = true;
};

const openInNewTab = () => {
  window.open(chapterUrl.value, '_blank');
  closeContextMenu();
};

const copyChapterUrl = async () => {
  try {
    await navigator.clipboard.writeText(chapterUrl.value);
    console.log('章节链接已复制到剪贴板');
    // 这里可以添加提示消息
  } catch (error) {
    console.error('复制链接失败:', error);
    // 降级方案：使用传统方式复制
    fallbackCopyTextToClipboard(chapterUrl.value);
  }
  closeContextMenu();
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

const closeContextMenu = () => {
  showContextMenu.value = false;
};

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (showContextMenu.value && 
      contextMenuRef.value && 
      !contextMenuRef.value.contains(event.target as Node)) {
    closeContextMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('contextmenu', closeContextMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('contextmenu', closeContextMenu);
});
</script>

<style scoped>
.chapter-link-wrapper {
  position: relative;
}

.chapter-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #93c5fd;
    transform: translateX(4px);
  }
  
  &.highlighted {
    background: rgba(59, 130, 246, 0.3);
    color: #93c5fd;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    transform: translateX(4px);
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
  
  .chapter-link:hover & {
    color: #f8fafc;
  }
}

.chapter-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  
  .chapter-link:hover & {
    opacity: 1;
  }
}

.action-icon,
.external-icon {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
}

.external-icon {
  color: #10b981;
}

.context-menu {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(51, 65, 85, 0.8);
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  min-width: 160px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #f8fafc;
  }
}

.menu-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
</style>