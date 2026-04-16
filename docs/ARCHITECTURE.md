# 技术架构设计

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Web App  │  │ iOS App  │  │Android App│                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (Kong/Nginx)               │
│                   认证、限流、路由、监控                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  用户服务     │    │  游戏服务     │    │  AI服务      │
│  User Service│    │ Game Service │    │ AI Service   │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据层                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │PostgreSQL│  │  Redis   │  │  MongoDB │  │   OSS    │   │
│  │ 关系数据  │  │  缓存    │  │  游戏数据 │  │ 文件存储 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选型

#### 前端技术栈
| 技术 | 用途 | 选型理由 |
|------|------|----------|
| React 18 | UI框架 | 生态成熟、组件化开发 |
| TypeScript | 开发语言 | 类型安全、开发体验好 |
| Zustand | 状态管理 | 轻量、简洁 |
| TailwindCSS | 样式方案 | 快速开发、响应式 |
| Vite | 构建工具 | 快速冷启动、HMR |
| React Query | 数据请求 | 缓存、自动刷新 |

#### 后端技术栈
| 技术 | 用途 | 选型理由 |
|------|------|----------|
| Node.js/Go | 服务端语言 | 高并发、生态好 |
| NestJS/Gin | Web框架 | 模块化、企业级 |
| PostgreSQL | 主数据库 | ACID、成熟稳定 |
| MongoDB | 游戏数据 | 灵活Schema |
| Redis | 缓存 | 高性能、数据结构丰富 |
| RabbitMQ | 消息队列 | 解耦、异步处理 |

#### AI服务
| 服务 | 用途 | 方案 |
|------|------|------|
| LLM | 文本生成/对话 | OpenAI API / 私有化部署 |
| 图像生成 | AI画图 | Stable Diffusion / Midjourney API |
| 语音合成 | TTS/STT | Azure Speech / 阿里云 |
| 人脸识别 | 趣味玩法 | 百度AI / 腾讯云 |

#### 基础设施
| 组件 | 选型 | 说明 |
|------|------|------|
| 容器编排 | Kubernetes | 弹性伸缩 |
| 服务网格 | Istio | 服务治理 |
| 监控 | Prometheus + Grafana | 全链路监控 |
| 日志 | ELK Stack | 日志收集分析 |
| CI/CD | GitHub Actions / GitLab CI | 自动化部署 |

## 2. 核心模块设计

### 2.1 用户服务

#### 数据模型
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  nickname VARCHAR(50),
  avatar_url VARCHAR(500),
  vip_level INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 第三方登录
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider VARCHAR(20), -- wechat, google, apple
  provider_user_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户偏好
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  favorite_games UUID[],
  notification_enabled BOOLEAN DEFAULT true,
  language VARCHAR(10) DEFAULT 'zh-CN'
);
```

#### API设计
```
POST   /api/auth/register      # 注册
POST   /api/auth/login         # 登录
POST   /api/auth/logout        # 登出
POST   /api/auth/refresh       # 刷新Token
GET    /api/users/me           # 获取当前用户
PUT    /api/users/me           # 更新用户信息
POST   /api/users/me/avatar    # 上传头像
```

### 2.2 游戏服务

#### 游戏模型设计
```javascript
// MongoDB Schema
const GameSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: [String], // puzzle, action, creative, etc.
  version: String,
  thumbnail: String,
  banner: String,
  
  // 游戏配置
  config: {
    maxPlayers: Number,
    avgDuration: Number, // 分钟
    difficulty: String,
    tags: [String]
  },
  
  // AI需求
  aiRequirements: {
    llm: { enabled: Boolean, model: String },
    imageGen: { enabled: Boolean, model: String },
    speech: { enabled: Boolean, type: String }
  },
  
  // 资源
  assets: {
    bundleUrl: String,
    size: Number, // bytes
    hash: String
  },
  
  // 状态
  status: String, // draft, published, deprecated
  publishedAt: Date,
  
  // 统计
  stats: {
    playCount: Number,
    likeCount: Number,
    rating: Number
  }
});
```

#### 游戏运行时架构
```
┌─────────────────────────────────────────┐
│           Game Container                │
│  ┌───────────────────────────────────┐ │
│  │      Game Runtime (iframe/webview) │ │
│  │  ┌──────────┐      ┌──────────┐   │ │
│  │  │ Game SDK │◄────►│ Platform │   │ │
│  │  │          │      │   API    │   │ │
│  │  └──────────┘      └──────────┘   │ │
│  │         ▲                          │ │
│  │         │ Game Bridge             │ │
│  │         ▼                          │ │
│  │  ┌──────────────────────────┐     │ │
│  │  │   Game Logic (Game Code) │     │ │
│  │  └──────────────────────────┘     │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### API设计
```
GET    /api/games              # 游戏列表
GET    /api/games/:id          # 游戏详情
POST   /api/games/:id/play     # 开始游戏
POST   /api/games/:id/finish   # 结束游戏
GET    /api/games/:id/leaderboard # 排行榜
POST   /api/games/:id/like     # 点赞
```

### 2.3 AI服务

#### 服务架构
```
┌────────────────────────────────────────┐
│           AI Gateway                   │
│  - 统一接口                             │
│  - 限流控制                             │
│  - 成本统计                             │
│  - 结果缓存                             │
└────────────────────────────────────────┘
            │
    ┌───────┼───────┬───────┐
    ▼       ▼       ▼       ▼
┌──────┐┌──────┐┌──────┐┌──────┐
│ LLM  ││Image ││Speech││ Vision│
│Pool  ││ Pool ││ Pool ││ Pool  │
└──────┘└──────┘└──────┘└──────┘
    │       │       │       │
    ▼       ▼       ▼       ▼
 OpenAI  SD API  Azure   百度AI
 Local   Local   Aliyun  腾讯云
 Model   Model   API     API
```

#### AI接口抽象
```typescript
interface AIProvider {
  name: string;
  generateText(prompt: string, options?: TextOptions): Promise<string>;
  generateImage(prompt: string, options?: ImageOptions): Promise<string>;
  textToSpeech(text: string, options?: SpeechOptions): Promise<Buffer>;
  speechToText(audio: Buffer): Promise<string>;
}

class AIManager {
  providers: Map<string, AIProvider>;
  
  async generateText(prompt: string, preferredProvider?: string): Promise<string> {
    // 负载均衡、故障转移、成本优化
    const provider = this.selectProvider('text', preferredProvider);
    return provider.generateText(prompt);
  }
}
```

#### API设计
```
POST /api/ai/text/generate    # 文本生成
POST /api/ai/image/generate   # 图像生成
POST /api/ai/speech/tts       # 文字转语音
POST /api/ai/speech/stt       # 语音转文字
POST /api/ai/vision/analyze   # 图像分析
```

### 2.4 社交服务

#### 数据模型
```sql
-- 好友关系
CREATE TABLE friendships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  friend_id UUID REFERENCES users(id),
  status VARCHAR(20), -- pending, accepted, blocked
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 成就
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  icon_url VARCHAR(500),
  condition JSONB,
  reward_coins INTEGER
);

-- 用户成就
CREATE TABLE user_achievements (
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(user_id, achievement_id)
);
```

## 3. 游戏接入规范

### 3.1 游戏SDK接口
```typescript
interface GameSDK {
  // 用户信息
  getUser(): Promise<User>;
  
  // AI能力
  ai: {
    generateText(prompt: string): Promise<string>;
    generateImage(prompt: string): Promise<string>;
  };
  
  // 存储
  storage: {
    save(data: any): Promise<void>;
    load(): Promise<any>;
    clear(): Promise<void>;
  };
  
  // 社交
  social: {
    share(data: ShareData): Promise<void>;
    inviteFriends(): Promise<User[]>;
  };
  
  // 支付
  payment: {
    purchase(itemId: string): Promise<PurchaseResult>;
  };
  
  // 事件上报
  analytics: {
    track(event: string, data?: any): void;
  };
}
```

### 3.2 游戏生命周期
```typescript
interface GameLifecycle {
  // 游戏加载完成
  onLoad(): void;
  
  // 游戏开始
  onStart(): void;
  
  // 游戏暂停
  onPause(): void;
  
  // 游戏恢复
  onResume(): void;
  
  // 游戏结束
  onFinish(result: GameResult): void;
  
  // 游戏销毁
  onDestroy(): void;
}
```

## 4. 性能优化

### 4.1 前端优化
- 代码分割（按游戏模块）
- 资源懒加载
- Service Worker缓存
- CDN加速
- 图片优化（WebP、懒加载）

### 4.2 后端优化
- Redis缓存热点数据
- 数据库读写分离
- 消息队列异步处理
- AI请求结果缓存
- 限流保护

### 4.3 AI成本控制
- 请求缓存（相同prompt复用）
- 模型分级（简单任务用小模型）
- 批量处理
- 用户配额限制
- 降级策略

## 5. 安全设计

### 5.1 认证授权
- JWT Token认证
- OAuth 2.0第三方登录
- Refresh Token机制
- API签名验证

### 5.2 数据安全
- 敏感数据加密存储
- HTTPS传输加密
- SQL注入防护
- XSS/CSRF防护

### 5.3 内容安全
- 用户生成内容审核
- AI输出内容过滤
- 敏感词过滤

## 6. 部署架构

### 6.1 生产环境
```
┌─────────────────────────────────────────┐
│            CDN (全球节点)                │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)           │
└─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌────────┐     ┌────────┐     ┌────────┐
│  Pod1  │     │  Pod2  │     │  Pod3  │
│  App   │     │  App   │     │  App   │
└────────┘     └────────┘     └────────┘
    │               │               │
    └───────────────┼───────────────┘
                    ▼
        ┌──────────────────────┐
        │   Database Cluster  │
        │  (主从复制+读写分离) │
        └──────────────────────┘
```

### 6.2 监控告警
- 服务健康监控
- 性能指标监控（QPS、延迟、错误率）
- 业务指标监控（DAU、留存、转化）
- AI成本监控
- 异常告警（短信、邮件、企业微信）