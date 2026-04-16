# 游戏开发快速指南

## 5分钟快速开始

### 1. 创建游戏目录

```
games/my-game/
├── manifest.json    # 游戏配置 (必需)
├── index.html       # 游戏入口 (必需)
└── assets/          # 图片等资源
```

### 2. 编写 manifest.json

```json
{
  "id": "my-game",
  "name": "My Game",
  "slug": "my-game",
  "version": "1.0.0",
  "entry": "/index.html",
  "config": {
    "maxPlayers": 1,
    "avgDuration": 5
  },
  "aiRequirements": {
    "llm": { "enabled": true }
  },
  "permissions": ["user.info", "storage", "ai.text"]
}
```

### 3. 引入 SDK

在 index.html 中：

```html
<script src="/sdk/game-sdk.umd.js"></script>
```

### 4. 实现生命周期钩子

```javascript
window.GameLifecycle = {
  async onInit(config) {
    this.sdk = new GameSDK.GameSDK(config)
    this.sdk.onReady(() => {
      console.log('SDK ready')
    })
  },

  onLoad() {
    /* 加载资源 */
  },
  onStart() {
    /* 开始游戏 */
  },
  onPause() {
    /* 暂停 */
  },
  onResume() {
    /* 恢复 */
  },
  onFinish(result) {
    /* 结束，返回结果 */ return { score: 100 }
  },
  onDestroy() {
    /* 清理 */
  },
}
```

## SDK API 参考

### AI 能力

```javascript
// 文本生成
const text = await sdk.ai.generateText('prompt', {
  maxTokens: 100,
  temperature: 0.7,
})

// 图像生成
const imageUrl = await sdk.ai.generateImage('a cute cat', {
  size: '512x512',
})
```

### 存储数据

```javascript
// 保存
await sdk.storage.save('level', 5)

// 加载
const level = await sdk.storage.load('level')

// 清除
await sdk.storage.clear()
```

### 用户信息

```javascript
const user = await sdk.getUser()
// { id, nickname, avatar, vipLevel, coins }
```

### 数据上报

```javascript
sdk.analytics.track('level_complete', {
  level: 5,
  score: 1000,
})
```

### 排行榜

```javascript
// 提交分数
await sdk.leaderboard.submitScore(1000)

// 获取排行
const ranks = await sdk.leaderboard.getRanking('global', 100)
```

## 通知平台游戏结束

```javascript
window.parent.postMessage(
  {
    type: 'game:finish',
    payload: {
      score: 100,
      duration: 60,
      achievements: ['first_win'],
    },
  },
  '*'
)
```

## 完整示例

参考 `games/templates/minimal-game/` 目录中的完整示例。

## 本地测试

1. 启动平台开发服务器：`npm run dev`
2. 将游戏目录放到 `games/` 下
3. 在平台注册游戏（通过 API）
4. 访问 `/game/{gameId}` 测试运行

## 注意事项

- 游戏在 iframe 中运行，使用 postMessage 与平台通信
- SDK 初始化后会自动调用 onInit
- 游戏结束时必须发送 `game:finish` 消息
- AI 请求有配额限制，请合理使用
