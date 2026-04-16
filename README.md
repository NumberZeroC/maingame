# AI Game Platform

AI驱动的轻量级小游戏平台 - 支持Web和移动端

## 项目定位

一站式AI小游戏平台，集成多种AI功能游戏，提供沉浸式游戏体验。

## 核心特性

- 多AI小游戏集成
- 跨平台支持（Web优先，移动端扩展）
- 统一用户系统
- AI能力服务平台

## 项目结构

```
.
├── docs/               # 产品设计文档
│   ├── PRD.md         # 产品需求文档
│   ├── ARCHITECTURE.md # 技术架构
│   ├── GAME-SPEC.md   # 游戏接入规范
│   ├── ROADMAP.md     # 开发路线图
│   ├── UI-DESIGN.md   # UI设计规范
│   ├── PAGE-DESIGN.md # 页面设计
│   └── DEV-GUIDE.md   # 开发指南
├── web/               # Web前端 (React + TypeScript + Vite)
│   ├── src/           # 源代码
│   └── package.json   # 前端依赖
├── server/            # 后端服务 (NestJS)
│   ├── src/           # 源代码
│   └── package.json   # 后端依赖
├── games/             # 游戏模块
├── docker-compose.yml # 本地数据库配置
└── package.json       # 根项目配置
```

## 技术栈

| 层级     | 技术                                                          |
| -------- | ------------------------------------------------------------- |
| 前端     | React 18, TypeScript, Vite, TailwindCSS, Zustand, React Query |
| 后端     | NestJS, TypeScript, Passport, JWT                             |
| 数据库   | PostgreSQL (用户), MongoDB (游戏), Redis (缓存)               |
| AI服务   | OpenAI, Stability AI                                          |
| 基础设施 | Docker, Docker Compose                                        |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动数据库

```bash
docker-compose up -d
```

### 3. 配置环境变量

```bash
cp server/.env.example server/.env
# 编辑 server/.env，配置 API Keys 等
```

### 4. 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:web    # 前端 http://localhost:3000
npm run dev:server # 后端 http://localhost:4000
```

## 已实现功能

### 前端

- ✅ 项目结构搭建
- ✅ 路由配置
- ✅ 基础组件 (Header, TabBar, GameCard, Layout)
- ✅ 页面 (首页, 游戏详情, 排行榜, 个人中心, 登录)
- ✅ TailwindCSS 配置
- ✅ 响应式布局

### 后端

- ✅ NestJS 项目结构
- ✅ 用户模块 (注册, 登录, JWT认证)
- ✅ 游戏模块 (CRUD, MongoDB Schema)
- ✅ AI模块 (OpenAI接口)
- ✅ 数据库配置
- ✅ API路由

### 基础设施

- ✅ Docker Compose (PostgreSQL, MongoDB, Redis)
- ✅ ESLint, Prettier 配置
- ✅ TypeScript 配置

## 开发指南

详细开发指南请参考 [docs/DEV-GUIDE.md](docs/DEV-GUIDE.md)

## 下一步

1. 安装依赖并启动服务
2. 开发第一款游戏 (AI画图猜词)
3. 完善API和前端交互
4. 添加测试
