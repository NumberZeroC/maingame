# 开发指南

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (可选，用于本地数据库)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动数据库 (使用Docker)

```bash
docker-compose up -d
```

或手动安装：

- PostgreSQL 15
- MongoDB 6
- Redis 7

### 3. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp server/.env.example server/.env
```

修改必要的配置，特别是：

- 数据库连接信息
- JWT Secret
- AI API Keys (OpenAI, Stability AI等)

### 4. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:web   # 前端 http://localhost:3000
npm run dev:server # 后端 http://localhost:4000
```

## 项目结构

### 前端 (web/)

```
web/
├── src/
│   ├── components/    # 共享组件
│   ├── pages/         # 页面组件
│   ├── hooks/         # 自定义Hooks
│   ├── stores/        # Zustand状态管理
│   ├── services/      # API服务
│   ├── utils/         # 工具函数
│   ├── types/         # TypeScript类型定义
│   └── App.tsx        # 应用入口
│   └── main.tsx       # React入口
│   └── index.css      # 全局样式
├── public/            # 静态资源
├── index.html         # HTML模板
└── vite.config.ts     # Vite配置
```

### 后端 (server/)

```
server/
├── src/
│   ├── modules/
│   │   ├── auth/      # 认证模块
│   │   ├── users/     # 用户模块
│   │   ├── games/     # 游戏模块
│   │   └── ai/        # AI服务模块
│   ├── common/
│   │   ├── guards/    # 守卫
│   │   ├── filters/   # 异常过滤器
│   │   ├── pipes/     # 管道
│   │   └── decorators/ # 自定义装饰器
│   ├── config/        # 配置
│   ├── app.module.ts  # 根模块
│   └── main.ts        # 入口文件
├── test/              # 测试文件
└── .env               # 环境变量
```

## API文档

启动服务器后访问：

- Swagger UI: http://localhost:4000/api (待添加)

## 开发规范

### 代码风格

- 使用 Prettier 格式化代码
- 使用 ESLint 检查代码
- 提交前运行 `npm run lint` 和 `npm run format`

### Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建配置等
```

### 分支策略

- main: 生产分支
- develop: 开发分支
- feature/\*: 功能分支
- hotfix/\*: 紧急修复分支

## 测试

```bash
npm run test
```

## 构建

```bash
npm run build
```

## 常见问题

### 数据库连接失败

检查数据库是否启动：

```bash
docker ps
```

检查连接配置是否正确。

### AI API调用失败

确保 `.env` 中配置了正确的 API Key：

- `OPENAI_API_KEY`
- `STABILITY_API_KEY`

### 前端无法访问后端API

检查 CORS 配置和代理设置。

## 部署

待补充...
