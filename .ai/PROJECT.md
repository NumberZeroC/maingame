# AI Game Platform - Project Overview

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Web)                           │
│  React + Vite + React Query + Zustand + TailwindCSS         │
├─────────────────────────────────────────────────────────────┤
│                     Backend (Server)                         │
│  NestJS + TypeORM (PostgreSQL) + Mongoose + Redis           │
├─────────────────────────────────────────────────────────────┤
│                     AI Layer                                 │
│  Multi-provider: Aliyun CodingPlan, Zhipu, DeepSeek, OpenAI │
│  Features: Fallback, Rate Limiting, Cost Tracking           │
├─────────────────────────────────────────────────────────────┤
│                     Game Runtime                             │
│  iframe isolation + SDK injection + postMessage             │
└─────────────────────────────────────────────────────────────┘
```

## Database

| Database | Usage |
|----------|-------|
| PostgreSQL | Users, Auth, Relations |
| MongoDB | Games, Sessions, Records, Leaderboard |
| Redis | Cache, Hot data |

## Key APIs

### Auth
- POST /auth/register
- POST /auth/login
- POST /auth/refresh

### Games
- GET /games
- GET /games/:id
- GET /games/:id/manifest
- POST /games/:id/leaderboard/submit

### AI
- POST /ai/text/generate
- POST /ai/chat
- POST /ai/image/generate

### Users
- GET /users/me
- PUT /users/me

## Game SDK

### User
```js
sdk.getUser() // { id, nickname, avatar, vipLevel, coins }
```

### AI
```js
sdk.ai.generateText(prompt, options)
sdk.ai.generateImage(prompt, options)
```

### Storage
```js
sdk.storage.save(key, value)
sdk.storage.load(key)
sdk.storage.clear()
```

### Leaderboard
```js
sdk.leaderboard.submitScore(score, extraData)
sdk.leaderboard.getRanking(type, limit)
```

### Analytics
```js
sdk.analytics.track(event, data)
```

## Game Lifecycle

```js
window.GameLifecycle = {
  onInit(config),
  onLoad(),
  onStart(),
  onPause(),
  onResume(),
  onFinish(result),
  onDestroy(),
}
```

## Game Manifest

```json
{
  "id": "game-id",
  "name": "游戏名称",
  "version": "1.0.0",
  "entry": "/index.html",
  "config": {
    "maxPlayers": 1,
    "avgDuration": 5,
    "difficulty": "easy",
    "orientation": "portrait"
  },
  "aiRequirements": {
    "llm": { enabled: true, model: "default" },
    "imageGen": { enabled: true }
  },
  "permissions": ["user.info", "storage", "ai.text", "ai.image"]
}
```