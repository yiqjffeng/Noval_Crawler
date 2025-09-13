# 小说爬虫前端UI设计文档（优化版，支持Windows打包）

## 一、设计概述
本文档描述小说爬虫项目的前端UI设计方案，涵盖界面设计、交互流程、视觉风格及技术实现等核心内容。前端采用现代Web技术栈，遵循响应式设计原则，同时预留与**桌面应用（Electron/Tauri）** 的集成能力，确保可打包为Windows应用，兼顾Web端与桌面端的使用场景。


## 二、基础信息
### 1. 技术栈
| 类别         | 技术选型                          |
|--------------|-----------------------------------|
| 核心框架     | Vue 3 + TypeScript                |
| UI组件库     | Element Plus                      |
| 样式解决方案 | Tailwind CSS                      |
| 开发工具     | Vite                              |
| 状态管理     | Pinia                             |
| HTTP请求     | Axios                             |
| 路由管理     | Vue Router                        |
| 构建工具     | Vite                              |
| 桌面打包方案 | Electron（推荐） / Tauri          |

### 2. 部署目录
- 前端代码统一存放于 `ui/` 目录下，便于项目结构管理与后续集成。


## 三、桌面应用适配原则
### 1. 与后端的通信模式
- **服务检测**：桌面应用启动时，自动检测本地是否已启动FastAPI服务。
- **后端启动器**：若本地服务未启动，可通过Electron调用Python可执行文件，集成本地后端启动器，实现“一键启动”。
- **API地址兼容**：前端API地址从环境变量读取，同时兼容 `http://127.0.0.1:8000`（本地服务）与远程服务地址，灵活适配不同部署场景。

### 2. 文件系统交互
- **路径选择**：下载路径选择功能使用**原生文件对话框**，通过Electron的 `dialog.showOpenDialog` 或Tauri API实现，避免浏览器沙盒限制。
- **进度文件存储**：进度文件直接保存到本地路径（如用户指定的下载目录），而非浏览器沙盒，确保数据持久化与可访问性。

### 3. 配置管理
- **存储位置**：用户偏好（如下载路径、最近搜索记录）存储到本地文件系统，Electron环境下使用 `appData` 目录，Tauri环境下使用 `configDir` 目录，替代浏览器的 `localStorage`。
- **存储格式**：采用JSON文件存储配置，便于用户迁移、备份与手动修改。

### 4. 安装包需求
- **Electron**：使用 `electron-builder` 生成 `.exe` 安装包，支持Windows系统标准安装流程。
- **Tauri**：通过内置CLI打包，安装包体积更小（仅几MB），启动速度更快。


## 四、界面设计（含桌面应用交互新增功能）
界面核心结构与原版保持一致，针对桌面应用场景新增以下交互功能，提升用户体验：

### 1. 搜索界面
- **历史记录优化**：桌面版支持“最近搜索下拉历史”，历史记录存储于本地JSON文件，关闭应用后不丢失。
- **快捷键支持**：新增 `Ctrl+F` 快捷键，触发时自动聚焦搜索框，提升操作效率。

### 2. 搜索结果界面
- **右键菜单扩展**：新增右键菜单选项，包括“复制书籍链接”“在浏览器中打开”，快速实现链接相关操作。
- **搜索通知**：搜索完成后触发**系统桌面通知**（通过Electron的 `Notification` 或Tauri Notification API），无需用户等待界面刷新即可知晓结果状态。

### 3. 书籍详情界面
- **外部链接跳转**：新增“打开原网站”按钮，点击后调用系统默认浏览器打开书籍原网页，方便用户查看完整信息。
- **封面本地保存**：支持右键点击书籍封面，通过菜单选项将封面图片保存到本地磁盘。

### 4. 下载页面
- **路径选择升级**：下载路径选择使用**系统文件夹选择器**，直观选择本地目录，避免手动输入路径错误。
- **下载完成提示**：下载完成后弹出系统通知，并提供“打开文件夹”按钮，点击直接跳转至下载文件所在目录。
- **后台运行支持**：支持应用最小化到系统托盘，下载任务在后台继续执行，不影响用户其他操作。


## 五、技术实现
### 1. 项目结构（优化版）
```
ui/
├── public/                  # 静态资源（图标、全局样式等）
├── src/
│   ├── assets/              # 图片、字体等资源
│   ├── components/          # 通用UI组件（按钮、卡片等）
│   ├── views/               # 页面组件（搜索页、详情页等）
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia状态管理
│   ├── utils/               # 工具函数（格式化、验证等）
│   ├── composables/         # 组合式函数（复用逻辑）
│   ├── types/               # TypeScript类型定义
│   ├── api/                 # API请求封装
│   ├── desktop/             # 桌面应用特定逻辑（文件选择、通知等，统一接口）
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── electron/                # Electron主进程代码（可选，仅Electron方案使用）
│   ├── main.js              # 主进程逻辑（窗口管理、IPC通信）
│   └── preload.js           # 预加载脚本（桥接主进程与渲染进程）
├── tauri.conf.json          # Tauri配置文件（可选，仅Tauri方案使用）
├── package.json             # 项目依赖与脚本配置
├── tsconfig.json            # TypeScript配置
└── vite.config.ts           # Vite构建配置
```

### 2. 桌面应用集成
#### （1）Electron方案
- **主进程功能**：
  1. 启动Electron窗口，加载前端构建后的 `dist/index.html`。
  2. 定义IPC（进程间通信）通道，实现前端与主进程的交互（如调用本地文件选择器、发送系统通知）。
- **打包流程**：
  使用 `electron-builder` 工具，执行打包命令后生成Windows平台的 `.exe` 安装包。

#### （2）Tauri方案
- **Rust后端功能**：
  1. 提供文件选择、配置存储、系统通知等原生能力，通过Rust代码实现。
  2. 使用WebView渲染前端 `dist/` 目录下的资源，无需额外启动浏览器。
- **打包流程**：
  通过 `cargo tauri build` 命令打包，生成体积极小（5~10MB）的 `.exe` 文件。

### 3. API通信配置
- **环境变量定义**：在 `.env` 文件中配置API基础地址，支持本地与远程服务切换：
  ```env
  VITE_API_URL=http://127.0.0.1:8000
  ```
- **动态修改支持**：在Electron环境下，可通过主进程逻辑动态修改API地址，适配本地服务启停、远程服务切换场景。

### 4. 桌面功能统一封装
在 `src/desktop/` 目录下封装桌面应用核心功能，提供与环境无关的统一接口，前端逻辑无需感知底层实现（Electron/Tauri），示例如下：
```typescript
// src/desktop/path.ts
export function selectDownloadPath(): Promise<string> {
  // Electron环境
  if (window.electron) {
    return window.electron.invoke("select-path");
  }
  // Tauri环境
  if (window.__TAURI__) {
    return window.__TAURI__.dialog.open({
      directory: true,
      title: "选择下载目录"
    }) as Promise<string>;
  }
  // 浏览器环境降级处理
  return Promise.resolve("/downloads");
}
```


## 六、部署与打包流程
### 1. Web端部署
1. 执行构建命令：`npm run build`，生成静态资源到 `dist/` 目录。
2. 将 `dist/` 目录部署到Nginx、Apache等Web服务器，即可通过浏览器访问。

### 2. Windows桌面应用打包
#### （1）Electron方案
1. 先构建前端资源：`npm run build`。
2. 执行Electron打包命令：`npm run electron:build`（需在 `package.json` 中配置对应脚本）。
3. 输出产物：`novel-downloader-setup-x64.exe`（标准Windows安装包）。

#### （2）Tauri方案
1. 先构建前端资源：`npm run build`。
2. 执行Tauri打包命令：`cargo tauri build`。
3. 输出产物：`novel-downloader-x64.exe`（体积约5~10MB，绿色免安装或轻量安装）。


## 七、开发规范（新增）
为确保代码可维护性与跨环境兼容性，需遵循以下开发规范：
1. **环境隔离原则**：前端核心逻辑（如页面渲染、数据处理）尽量与运行环境（浏览器/桌面）无关，通过 `src/desktop/` 模块隔离桌面特有逻辑。
2. **原生API调用规范**：避免在前端代码中直接调用Node.js（Electron）或Rust（Tauri）的原生API，必须通过 `src/desktop/` 封装的统一接口调用，降低环境依赖。
3. **配置与路径规范**：所有下载路径、API地址、用户配置等动态信息，需通过API接口或 `src/desktop/` 提供的方法获取，禁止硬编码，确保灵活性。
4. **类型安全规范**：使用TypeScript定义所有接口、函数参数及返回值类型，尤其是 `src/desktop/` 模块的跨环境接口，避免类型不匹配问题。