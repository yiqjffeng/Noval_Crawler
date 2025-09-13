// 简化的其他视图组件，用于路由完整性

// TasksView.vue - 下载任务管理
export const TasksView = {
  template: `
    <div class="tasks-view">
      <div class="tasks-container">
        <h1 class="tasks-title">下载任务</h1>
        <p class="tasks-placeholder">下载任务管理界面开发中...</p>
      </div>
    </div>
  `,
  style: `
    .tasks-view { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 2rem; }
    .tasks-container { max-width: 1000px; margin: 0 auto; }
    .tasks-title { color: #f8fafc; font-size: 2rem; margin-bottom: 1rem; }
    .tasks-placeholder { color: #94a3b8; font-size: 1.125rem; }
  `
};

// FavoritesView.vue - 收藏管理  
export const FavoritesView = {
  template: `
    <div class="favorites-view">
      <div class="favorites-container">
        <h1 class="favorites-title">我的收藏</h1>
        <p class="favorites-placeholder">收藏管理界面开发中...</p>
      </div>
    </div>
  `,
  style: `
    .favorites-view { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 2rem; }
    .favorites-container { max-width: 1000px; margin: 0 auto; }
    .favorites-title { color: #f8fafc; font-size: 2rem; margin-bottom: 1rem; }
    .favorites-placeholder { color: #94a3b8; font-size: 1.125rem; }
  `
};

// HistoryView.vue - 阅读历史
export const HistoryView = {
  template: `
    <div class="history-view">
      <div class="history-container">
        <h1 class="history-title">阅读历史</h1>
        <p class="history-placeholder">阅读历史界面开发中...</p>
      </div>
    </div>
  `,
  style: `
    .history-view { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 2rem; }
    .history-container { max-width: 1000px; margin: 0 auto; }
    .history-title { color: #f8fafc; font-size: 2rem; margin-bottom: 1rem; }
    .history-placeholder { color: #94a3b8; font-size: 1.125rem; }
  `
};