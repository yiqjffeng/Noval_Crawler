# 小说爬虫前端UI设计文档

## 项目概述
基于Vue3 + Element Plus的现代化小说爬虫前端界面，采用灵动活泼的设计风格，提供流畅的搜索、浏览和下载体验。

## 技术栈
- **框架**: Vue3 + Vite
- **UI库**: Element Plus + 自定义组件
- **动画**: GSAP + CSS3动画
- **图标**: @element-plus/icons-vue
- **HTTP**: Axios
- **状态管理**: Pinia
- **样式**: SCSS + CSS变量

## 设计系统

### 色彩方案（灵动糖果风）
```scss
// 主色调
$primary: #6366F1;      // 梦幻紫
$secondary: #F59E0B;    // 温暖橙
$accent: #10B981;       // 清新绿

// 渐变背景
$gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

// 背景色
$bg-primary: #F8FAFC;
$bg-card: #FFFFFF;
$bg-hover: #F1F5F9;

// 文字色
$text-primary: #1E293B;
$text-secondary: #64748B;
$text-muted: #94A3B8;
```

### 圆角与阴影
```scss
// 圆角
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 24px;

// 阴影（漂浮效果）
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-md: 0 4px 20px rgba(0, 0, 0, 0.12);
$shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
$shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
```

## 页面架构

### 路由结构
```
/
├── 首页搜索 (HomePage)
├── 搜索结果 (SearchResults)
├── 书籍详情 (BookDetail)
└── 下载管理 (DownloadManager)
```

## 组件设计

### 1. 首页搜索 (HomePage)

#### 视觉设计
- **背景**: 动态渐变背景（紫-粉-蓝渐变）
- **搜索框**: 超大圆角输入框，聚焦时有发光动画
- **按钮**: 水晶质感按钮，悬停时微微上浮

#### 交互细节
```vue
<!-- 搜索框组件 -->
<template>
  <div class="hero-search">
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="🔍 搜索你想看的小说..."
        class="search-input"
        size="large"
        @keyup.enter="handleSearch"
      >
        <template #suffix>
          <el-icon class="search-icon" @click="handleSearch">
            <Search />
          </el-icon>
        </template>
      </el-input>
      <el-button 
        type="primary" 
        class="search-btn"
        :loading="searching"
        @click="handleSearch"
      >
        <span class="btn-text">开始探索</span>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.hero-search {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

.search-input {
  width: 500px;
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input:focus-within {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
```

### 2. 搜索结果卡片 (BookCard)

#### 设计特点
- **卡片**: 毛玻璃效果，悬停时上浮并放大
- **图片**: 圆角封面，加载时有骨架屏
- **信息**: 优雅的文本排版，关键信息突出
- **动画**: 卡片入场动画，延迟加载效果

#### 组件实现
```vue
<template>
  <div class="book-card" @click="goToDetail">
    <div class="card-glow"></div>
    <div class="card-content">
      <div class="cover-wrapper">
        <el-image
          :src="book.novel_cover"
          :alt="book.articlename"
          class="book-cover"
          lazy
        >
          <template #placeholder>
            <div class="cover-skeleton">
              <el-skeleton :rows="0" animated />
            </div>
          </template>
        </el-image>
      </div>
      
      <div class="book-info">
        <h3 class="book-title">{{ book.articlename }}</h3>
        <p class="book-author">✍️ {{ book.author }}</p>
        <p class="book-intro" :title="book.novel_info">
          {{ truncateText(book.novel_info, 80) }}
        </p>
        <div class="book-tags">
          <el-tag size="small" type="info">玄幻</el-tag>
          <el-tag size="small" type="success">完结</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-card {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.card-glow {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(245, 158, 11, 0.1));
}

.book-card:hover .card-glow {
  opacity: 1;
}

.book-cover {
  width: 120px;
  height: 160px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
```

### 3. 书籍详情页 (BookDetail)

#### 布局设计
- **顶部**: 书籍基本信息 + 封面大图
- **中部**: 目录树形结构，支持展开/收起
- **底部**: 下载配置区域

#### 目录展示
```vue
<template>
  <div class="book-detail">
    <div class="book-header">
      <div class="book-cover-large">
        <el-image :src="book.novel_cover" class="cover-img" />
      </div>
      <div class="book-meta">
        <h1 class="book-title-large">{{ book.articlename }}</h1>
        <p class="book-author-large">作者：{{ book.author }}</p>
        <p class="book-desc">{{ book.novel_info }}</p>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="showDownloadDialog">
            <el-icon><Download /></el-icon>
            开始下载
          </el-button>
        </div>
      </div>
    </div>

    <!-- 目录区域 -->
    <div class="catalog-section">
      <h2>📚 章节目录</h2>
      <div class="catalog-tree">
        <el-tree
          :data="catalogData"
          :props="defaultProps"
          @node-click="handleChapterClick"
          class="custom-tree"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <el-icon><Document /></el-icon>
              <span>{{ data.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
  </div>
</template>
```

### 4. 下载弹窗 (DownloadDialog)

#### 交互设计
- **动画**: 从底部滑入的抽屉式弹窗
- **配置**: 章节范围滑块，格式选择器
- **预览**: 实时显示下载文件名
- **进度**: 环形进度条 + 百分比显示

#### 弹窗实现
```vue
<template>
  <el-drawer
    v-model="downloadVisible"
    direction="btt"
    size="60%"
    class="download-drawer"
  >
    <template #header>
      <h2 class="drawer-title">📥 下载配置</h2>
    </template>
    
    <div class="download-config">
      <div class="config-item">
        <label>书籍名称</label>
        <el-input v-model="downloadConfig.bookName" class="config-input" />
      </div>
      
      <div class="config-item">
        <label>章节范围</label>
        <el-slider
          v-model="chapterRange"
          range
          :max="totalChapters"
          :marks="marks"
          class="range-slider"
        />
        <div class="range-display">
          {{ chapterRange[0] }} - {{ chapterRange[1] === totalChapters ? '全部' : chapterRange[1] }}
        </div>
      </div>
      
      <div class="config-item">
        <label>下载格式</label>
        <el-radio-group v-model="downloadConfig.format" class="format-group">
          <el-radio value="txt">📄 TXT</el-radio>
          <el-radio value="epub">📖 EPUB</el-radio>
        </el-radio-group>
      </div>
      
      <div class="config-preview">
        <p>文件名：{{ previewFilename }}</p>
        <p>大小预估：{{ estimatedSize }}</p>
      </div>
    </div>
    
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="downloadVisible = false">取消</el-button>
        <el-button type="primary" @click="startDownload" :loading="downloading">
          🚀 开始下载
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>
```

### 5. 下载进度卡片 (ProgressCard)

#### 动画效果
- **进度条**: 渐变色流动动画
- **状态**: 图标随状态变化
- **悬浮**: 详细进度信息提示

```vue
<template>
  <div class="progress-card" :class="`status-${task.status}`">
    <div class="progress-header">
      <div class="book-info-mini">
        <h4>{{ task.bookName }}</h4>
        <p>{{ task.chapters }} 章节</p>
      </div>
      <div class="status-icon">
        <el-icon v-if="task.status === 'running'" class="is-loading">
          <Loading />
        </el-icon>
        <el-icon v-else-if="task.status === 'completed'" style="color: #10B981">
          <CircleCheck />
        </el-icon>
        <el-icon v-else-if="task.status === 'failed'" style="color: #EF4444">
          <CircleClose />
        </el-icon>
      </div>
    </div>
    
    <div class="progress-body">
      <el-progress
        :percentage="task.progress"
        :color="progressColors"
        :stroke-width="8"
        class="progress-bar"
      />
      <div class="progress-stats">
        <span>{{ task.current }}/{{ task.total }} 章节</span>
        <span>{{ task.speed }}/s</span>
      </div>
    </div>
    
    <div class="progress-actions">
      <el-button 
        v-if="task.status === 'running'" 
        text 
        @click="pauseDownload(task.taskId)"
      >
        暂停
      </el-button>
      <el-button 
        v-if="task.status === 'paused'" 
        text 
        @click="resumeDownload(task.taskId)"
      >
        继续
      </el-button>
    </div>
  </div>
</template>
```

## 响应式设计

### 断点设计
```scss
// 响应式断点
$mobile: 768px;
$tablet: 1024px;
$desktop: 1200px;

// 响应式混合
@mixin respond-to($breakpoint) {
  @media (max-width: $breakpoint) {
    @content;
  }
}

// 使用示例
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  
  @include respond-to($tablet) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  @include respond-to($mobile) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
```

## 动画系统

### 入场动画
```javascript
// 使用GSAP实现流畅动画
import { gsap } from 'gsap'

// 卡片入场动画
const animateCards = () => {
  gsap.from('.book-card', {
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out"
  })
}

// 搜索框聚焦动画
const animateSearchFocus = () => {
  gsap.to('.search-input', {
    scale: 1.05,
    duration: 0.3,
    ease: "power2.inOut"
  })
}
```

### 微交互
```scss
// 按钮点击波纹效果
.btn-ripple {
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:active::after {
    width: 300px;
    height: 300px;
  }
}
```

## 错误处理与加载状态

### 加载骨架屏
```vue
<template>
  <div class="skeleton-container">
    <div class="skeleton-card" v-for="i in 6" :key="i">
      <div class="skeleton-cover"></div>
      <div class="skeleton-text">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.skeleton-card {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 16px;
  padding: 20px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

### 错误提示
```vue
<template>
  <el-empty 
    v-if="error"
    :image="errorImage"
    description="哎呀，出了点小问题～"
    class="error-empty"
  >
    <template #default>
      <div class="error-actions">
        <el-button type="primary" @click="retry">
          <el-icon><Refresh /></el-icon>
          再试一次
        </el-button>
      </div>
    </template>
  </el-empty>
</template>
```

## API集成

### 统一的API服务
```javascript
// api/index.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(config => {
  // 添加加载动画
  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    ElMessage.error(error.response?.data?.message || '网络错误')
    return Promise.reject(error)
  }
)

// API方法
export const searchApi = {
  search: (keyword) => api.post('/api/search', { keyword }),
  getCatalog: (novelId) => api.post('/api/catalog', { novel_id: novelId }),
  startDownload: (config) => api.post('/api/download/start', config),
  getTaskStatus: (taskId) => api.get(`/api/download/status/${taskId}`),
  getAllTasks: () => api.get('/api/download/tasks'),
  stopTask: (taskId) => api.post(`/api/download/stop/${taskId}`)
}
```

### 状态管理
```javascript
// stores/download.js
import { defineStore } from 'pinia'
import { searchApi } from '@/api'

export const useDownloadStore = defineStore('download', {
  state: () => ({
    tasks: [],
    activeTask: null,
    pollingInterval: null
  }),
  
  actions: {
    async startPolling() {
      this.pollingInterval = setInterval(async () => {
        if (this.tasks.some(task => task.status === 'running')) {
          await this.refreshTasks()
        }
      }, 2000)
    },
    
    async refreshTasks() {
      const response = await searchApi.getAllTasks()
      this.tasks = response.data
    }
  }
})
```

## 项目结构
```
src/
├── components/
│   ├── common/
│   │   ├── LoadingSpinner.vue
│   │   ├── ErrorBoundary.vue
│   │   └── AnimatedCard.vue
│   ├── search/
│   │   ├── SearchBar.vue
│   │   ├── BookCard.vue
│   │   └── SearchResults.vue
│   ├── book/
│   │   ├── BookDetail.vue
│   │   ├── CatalogTree.vue
│   │   └── BookActions.vue
│   └── download/
│       ├── DownloadDialog.vue
│       ├── ProgressCard.vue
│       └── DownloadManager.vue
├── views/
│   ├── HomePage.vue
│   ├── SearchResults.vue
│   ├── BookDetail.vue
│   └── DownloadManager.vue
├── stores/
│   ├── search.js
│   ├── book.js
│   └── download.js
├── styles/
│   ├── variables.scss
│   ├── animations.scss
│   └── components.scss
└── utils/
    ├── api.js
    ├── animations.js
    └── helpers.js
```

## 启动命令
```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

## 部署说明
支持静态部署到任何Web服务器，API接口通过环境变量配置：
```bash
# 生产环境
VITE_API_BASE_URL=http://your-api-domain.com
```