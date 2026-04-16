# UI设计规范

## 1. 设计理念

### 1.1 设计原则
- **简洁直观**: 减少认知负担，用户快速上手
- **AI为核心**: 突出AI特色，科技感与趣味性结合
- **一致性**: 统一的视觉语言和交互模式
- **响应式**: 适配多端（Web/移动端）

### 1.2 品牌调性
- 科技感 + 趣味性
- 年轻化、活力
- 友好、易接近

## 2. 设计系统

### 2.1 色彩系统

#### 主色调
| 名称 | 色值 | 用途 |
|------|------|------|
| Primary | `#6366F1` | 主按钮、强调元素 |
| Primary-Dark | `#4F46E5` | 悬停状态 |
| Primary-Light | `#818CF8` | 次要强调 |

#### 辅助色
| 名称 | 色值 | 用途 |
|------|------|------|
| Secondary | `#EC4899` | 次要按钮、标签 |
| Accent | `#14B8A6` | 成功状态、高亮 |
| Warning | `#F59E0B` | 警告提示 |
| Error | `#EF4444` | 错误状态 |
| Success | `#10B981` | 成功状态 |

#### 中性色
| 名称 | 色值 | 用途 |
|------|------|------|
| Gray-900 | `#111827` | 标题文字 |
| Gray-700 | `#374151` | 正文文字 |
| Gray-500 | `#6B7280` | 次要文字 |
| Gray-300 | `#D1D5DB` | 分割线 |
| Gray-100 | `#F3F4F6` | 背景色 |
| White | `#FFFFFF` | 卡片背景 |

#### 渐变色
```css
/* 主渐变 - 按钮、Banner */
.gradient-primary {
  background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%);
}

/* AI特色渐变 */
.gradient-ai {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
}

/* 游戏卡片渐变 */
.gradient-game {
  background: linear-gradient(135deg, #14B8A6 0%, #6366F1 100%);
}
```

### 2.2 字体系统

#### 字体家族
```css
/* 主字体 - 中文 */
font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", 
             "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

/* 标题字体 - 英文 */
font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;

/* 等宽字体 - 代码/数字 */
font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
```

#### 字体大小
| 名称 | 大小 | 行高 | 用途 |
|------|------|------|------|
| Display | 48px | 1.2 | 大标题 |
| H1 | 36px | 1.3 | 页面标题 |
| H2 | 28px | 1.4 | 区块标题 |
| H3 | 22px | 1.4 | 小标题 |
| Body | 16px | 1.6 | 正文 |
| Small | 14px | 1.5 | 辅助文字 |
| Caption | 12px | 1.4 | 标签、说明 |

#### 字重
```css
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### 2.3 间距系统

使用8px栅格系统：
| 名称 | 大小 | 用途 |
|------|------|------|
| xs | 4px | 最小间距 |
| sm | 8px | 紧凑间距 |
| md | 16px | 标准间距 |
| lg | 24px | 大间距 |
| xl | 32px | 区块间距 |
| 2xl | 48px | 大区块间距 |
| 3xl | 64px | 特大间距 |

### 2.4 圆角
| 名称 | 大小 | 用途 |
|------|------|------|
| sm | 4px | 小按钮、标签 |
| md | 8px | 输入框、小卡片 |
| lg | 12px | 卡片、按钮 |
| xl | 16px | 大卡片 |
| 2xl | 24px | 模态框 |
| full | 9999px | 圆形头像、胶囊按钮 |

### 2.5 阴影
```css
/* 卡片阴影 */
.shadow-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
              0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

/* 悬浮阴影 */
.shadow-elevated {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* 模态框阴影 */
.shadow-modal {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
```

### 2.6 图标

使用 [Heroicons](https://heroicons.com/) 或 [Lucide Icons](https://lucide.dev/)

风格：线条粗细 1.5px，圆角

### 2.7 插画

- 风格：扁平化、渐变色彩
- 配色：与品牌色一致
- 用途：空状态、引导页、错误提示

推荐资源：
- [unDraw](https://undraw.co/)
- [Storyset](https://storyset.com/)

## 3. 组件规范

### 3.1 按钮

#### 主按钮
```html
<button class="btn btn-primary">
  开始游戏
</button>
```
```css
.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}
```

#### 次要按钮
```html
<button class="btn btn-secondary">取消</button>
```

#### 图标按钮
```html
<button class="btn-icon">
  <svg>...</svg>
</button>
```

#### 按钮尺寸
| 尺寸 | Padding | 字号 |
|------|---------|------|
| Small | 8px 16px | 14px |
| Medium | 12px 24px | 16px |
| Large | 16px 32px | 18px |

### 3.2 输入框
```html
<div class="input-group">
  <label class="input-label">手机号</label>
  <input type="tel" class="input" placeholder="请输入手机号">
  <span class="input-error">手机号格式不正确</span>
</div>
```
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 16px;
}
.input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

### 3.3 卡片

#### 游戏卡片
```html
<div class="game-card">
  <div class="game-card-image">
    <img src="game.png" alt="游戏名称">
    <div class="game-card-badge">AI推荐</div>
  </div>
  <div class="game-card-content">
    <h3 class="game-card-title">AI画图猜词</h3>
    <p class="game-card-desc">AI生成图像，你来猜词</p>
    <div class="game-card-meta">
      <span class="rating">⭐ 4.8</span>
      <span class="players">👥 10万+玩家</span>
    </div>
  </div>
</div>
```

#### 用户卡片
```html
<div class="user-card">
  <img src="avatar.png" class="user-avatar">
  <div class="user-info">
    <h4 class="user-name">用户名</h4>
    <p class="user-stats">Lv.15 | 1000积分</p>
  </div>
</div>
```

### 3.4 导航

#### 顶部导航
```html
<nav class="navbar">
  <div class="navbar-brand">
    <img src="logo.svg" alt="Logo">
    <span>AI游戏平台</span>
  </div>
  <div class="navbar-menu">
    <a href="#" class="nav-link active">首页</a>
    <a href="#" class="nav-link">游戏</a>
    <a href="#" class="nav-link">排行</a>
  </div>
  <div class="navbar-actions">
    <button class="btn-avatar">
      <img src="avatar.png">
    </button>
  </div>
</nav>
```

#### 底部导航（移动端）
```html
<nav class="tabbar">
  <a href="#" class="tabbar-item active">
    <svg>首页图标</svg>
    <span>首页</span>
  </a>
  <a href="#" class="tabbar-item">
    <svg>游戏图标</svg>
    <span>游戏</span>
  </a>
  <a href="#" class="tabbar-item">
    <svg>排行图标</svg>
    <span>排行</span>
  </a>
  <a href="#" class="tabbar-item">
    <svg>我的图标</svg>
    <span>我的</span>
  </a>
</nav>
```

### 3.5 模态框
```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3>确认删除？</h3>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      <p>删除后无法恢复，确定要删除吗？</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">取消</button>
      <button class="btn btn-primary">确认</button>
    </div>
  </div>
</div>
```

### 3.6 标签
```html
<div class="tags">
  <span class="tag tag-ai">AI推荐</span>
  <span class="tag tag-hot">热门</span>
  <span class="tag tag-new">新游戏</span>
</div>
```

### 3.7 加载状态
```html
<!-- 骨架屏 -->
<div class="skeleton">
  <div class="skeleton-image"></div>
  <div class="skeleton-text"></div>
  <div class="skeleton-text short"></div>
</div>

<!-- 加载动画 -->
<div class="loading-spinner"></div>
```

### 3.8 空状态
```html
<div class="empty-state">
  <img src="empty.svg" alt="暂无数据">
  <h3>暂无游戏记录</h3>
  <p>快去体验精彩游戏吧</p>
  <button class="btn btn-primary">浏览游戏</button>
</div>
```

## 4. 页面布局

### 4.1 栅格系统

使用12列栅格：
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.grid {
  display: grid;
  gap: 24px;
}

.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
```

### 4.2 响应式断点
| 名称 | 宽度 | 说明 |
|------|------|------|
| Mobile | < 640px | 手机 |
| Tablet | 640px - 1024px | 平板 |
| Desktop | > 1024px | 桌面 |

### 4.3 页面容器
```css
/* 移动端优先 */
.page {
  min-height: 100vh;
  background: #F3F4F6;
}

/* 内容区域 */
.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

@media (min-width: 640px) {
  .content {
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .content {
    padding: 32px;
  }
}
```

## 5. 动画规范

### 5.1 过渡时长
| 类型 | 时长 | 用途 |
|------|------|------|
| Fast | 150ms | 按钮、图标 |
| Normal | 300ms | 卡片、面板 |
| Slow | 500ms | 页面切换 |

### 5.2 缓动函数
```css
/* 标准缓动 */
ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

/* 减速缓动 */
ease-decelerate: cubic-bezier(0, 0, 0.2, 1);

/* 加速缓动 */
ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

### 5.3 常用动画
```css
/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 上滑 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 缩放 */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 旋转 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 6. 图标规范

### 6.1 图标尺寸
| 名称 | 大小 | 用途 |
|------|------|------|
| xs | 12px | 标签内图标 |
| sm | 16px | 小图标 |
| md | 20px | 标准图标 |
| lg | 24px | 导航图标 |
| xl | 32px | 大图标 |

### 6.2 图标颜色
- 默认：Gray-500
- 激活：Primary
- 禁用：Gray-300

## 7. 无障碍设计

### 7.1 颜色对比度
- 文字与背景对比度 ≥ 4.5:1
- 大文字对比度 ≥ 3:1

### 7.2 交互反馈
- 所有交互元素支持键盘操作
- 焦点状态明显可见
- 错误提示清晰明确

### 7.3 ARIA标签
```html
<button aria-label="关闭对话框">
  <svg aria-hidden="true">...</svg>
</button>
```

## 8. 深色模式

### 8.1 色彩映射
| 浅色模式 | 深色模式 |
|----------|----------|
| White | Gray-900 |
| Gray-100 | Gray-800 |
| Gray-900 | Gray-100 |
| Primary | Primary-Light |

### 8.2 实现
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --text-primary: #F9FAFB;
    /* ... */
  }
}
```