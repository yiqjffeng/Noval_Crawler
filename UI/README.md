# 青墨书阁 - 小说爬虫前端

基于 Vue 3 + Vite + TypeScript 构建的现代化小说爬虫前端界面，采用淡蓝色主题设计，支持响应式交互和动态下载管理。

## 功能特性

- 🎯 **响应式搜索** - 支持小说名称和作者搜索
- 📚 **书籍展示** - 卡片式布局，展示封面、简介、作者信息
- 📖 **目录浏览** - 查看书籍完整目录结构
- ⬇️ **下载管理** - 实时进度跟踪，支持暂停/重试
- 📱 **移动优先** - 完全响应式设计
- 🎨 **现代化UI** - 淡蓝色主题，流畅动画效果
- ⚡ **实时更新** - WebSocket 支持下载状态实时同步

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **样式**: TailwindCSS
- **HTTP客户端**: Axios
- **图标**: Lucide Vue
- **动画**: CSS 动画 + Vue Transition

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── BookCard.vue     # 书籍卡片
│   ├── DownloadTaskCard.vue # 下载任务卡片
│   ├── DownloadModal.vue # 下载确认弹窗
│   ├── NotificationContainer.vue # 通知容器
│   └── GlobalLoading.vue # 全局加载
├── views/              # 页面组件
│   ├── Home.vue        # 主页（搜索）
│   ├── BookDetail.vue  # 书籍详情
│   ├── Downloads.vue   # 下载管理
│   └── Library.vue     # 我的书库
├── stores/             # 状态管理
│   ├── book.ts         # 书籍相关状态
│   ├── download.ts     # 下载任务状态
│   └── notification.ts # 通知消息状态
├── services/           # API服务
│   └── api.ts          # 后端API封装
├── types/              # TypeScript类型定义
└── styles/             # 样式文件
    └── index.css       # 全局样式
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 环境配置

### 开发环境代理

在 `vite.config.ts` 中配置了代理，将 `/api` 请求转发到后端服务：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }
  }
}
```

### 后端API接口

- `GET /api/search` - 搜索书籍
- `GET /api/catalog` - 获取书籍目录
- `POST /api/download/start` - 开始下载
- `GET /api/download/status/:task_id` - 获取下载状态
- `GET /api/download/tasks` - 获取所有任务

## 主题设计

采用淡蓝色系配色方案：

- **主色调**: 青蓝色 (#0ea5e9)
- **背景色**: 深灰色 (#1e293b)
- **文字色**: 浅灰色 (#e2e8f0)
- **强调色**: 青色 (#14b8a6)

## 响应式设计

- 移动端优先设计
- 断点：sm (640px), md (768px), lg (1024px), xl (1280px)
- 支持触摸手势操作

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 开发指南

### 添加新功能

1. 在 `types/index.ts` 中添加类型定义
2. 在 `stores/` 中创建或更新状态管理
3. 在 `components/` 中创建新组件
4. 在 `views/` 中创建新页面（如果需要）
5. 在 `router/index.ts` 中添加路由

### 样式规范

- 使用 TailwindCSS 工具类
- 遵循 BEM 命名规范
- 组件样式使用 scoped
- 全局样式放在 `styles/index.css`

### 代码规范

- 使用 TypeScript 严格模式
- 组件使用 Composition API
- 状态管理使用 Pinia
- 异步操作使用 async/await

## 部署

### 静态部署

构建完成后，将 `dist/` 目录部署到任何静态文件服务器：

```bash
npm run build
# 将 dist/ 目录上传到服务器
```

### Docker部署

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 许可证

MIT License