# 🎨 小说爬虫前端界面

基于Vue 3 + TypeScript + Tailwind CSS的现代化前端界面，提供小说搜索、目录浏览、章节阅读的完整Web体验。

## 🚀 快速启动

### 一键启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

服务启动后：
- **本地访问**: http://localhost:3000
- **网络访问**: http://192.168.x.x:3000 (局域网)

## 📁 项目结构

```
UI/
├── src/
│   ├── components/        # 组件目录
│   │   ├── common/        # 通用组件
│   │   ├── search/        # 搜索相关
│   │   ├── catalog/       # 目录相关
│   │   └── reader/        # 阅读器
│   ├── views/            # 页面视图
│   │   ├── SearchView.vue
│   │   ├── ResultsView.vue
│   │   ├── DetailView.vue
│   │   ├── ChapterReadView.vue
│   │   └── ...
│   ├── stores/           # 状态管理
│   ├── utils/            # 工具函数
│   └── types/            # TypeScript类型
├── public/               # 静态资源
└── package.json          # 项目配置
```

## 🎯 功能特性

### ✅ 已实现功能
- **智能搜索**: 关键词搜索小说
- **目录浏览**: 可视化目录结构
- **章节阅读**: 舒适的阅读体验
- **下载管理**: 批量下载小说
- **响应式设计**: 支持手机/平板/电脑
- **深色模式**: 护眼阅读模式

### 🎨 界面特色
- **现代化设计**: 简洁美观的UI
- **流畅动画**: 页面过渡和加载动画
- **交互友好**: 直观的操作体验
- **性能优化**: 快速加载和响应

## 🔧 开发指南

### 环境要求
- Node.js 18+
- npm 或 pnpm

### 开发命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

### 构建生产版本
```bash
npm run build
```

构建后的文件在 `dist/` 目录，可部署到任何静态服务器。

## 🌐 API集成

### 后端配置
默认连接本地FastAPI服务：
- **开发环境**: http://localhost:8000
- **生产环境**: 可在 `.env.production` 中配置

### 环境变量
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000

# .env.production
VITE_API_BASE_URL=https://your-api-domain.com
```

## 📱 响应式支持

### 断点设计
- **手机**: < 768px
- **平板**: 768px - 1024px
- **桌面**: > 1024px

### 适配特性
- 流式布局
- 弹性图片
- 触控优化
- 字体大小自适应

## 🎨 主题系统

### 颜色配置
基于Tailwind CSS的配色方案：
- **主色**: sky-500 (#0ea5e9)
- **成功**: emerald-500 (#10b981)
- **警告**: amber-500 (#f59e0b)
- **错误**: rose-500 (#f43f5e)

### 深色模式
支持系统主题自动切换，也可手动切换。

## 🚀 部署方案

### 静态部署
```bash
npm run build
# 部署dist目录到:
# - Netlify
# - Vercel
# - GitHub Pages
# - Nginx
```

### Docker部署
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

## 🐛 常见问题

### 端口冲突
```bash
# 修改端口
npm run dev -- --port 3001
```

### 依赖问题
```bash
# 清理缓存
npm cache clean --force

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

### 类型错误
```bash
# 运行类型检查
npm run type-check
```
