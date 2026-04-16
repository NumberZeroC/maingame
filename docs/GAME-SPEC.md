# 游戏接入规范

## 1. 概述

本文档定义了游戏接入AI游戏平台的技术规范，确保游戏能够与平台无缝集成。

## 2. 游戏包结构

### 2.1 标准目录结构
```
my-game/
├── manifest.json        # 游戏配置清单（必需）
├── index.html          # 游戏入口（必需）
├── main.js             # 游戏主逻辑（必需）
├── assets/             # 静态资源
│   ├── images/
│   ├── audio/
│   └── fonts/
├── styles/             # 样式文件
│   └── main.css
└── lib/                # 第三方库
    └── game-sdk.js
```

### 2.2 manifest.json
```json
{
  "id": "ai-draw-guess",
  "name": "AI画图猜词",
  "version": "1.0.0",
  "description": "AI生成图像，用户猜词游戏",
  "author": "Game Studio",
  "category": ["puzzle", "ai"],
  "tags": ["ai", "drawing", "guess"],
  
  "entry": "index.html",
  "icon": "assets/icon.png",
  "thumbnail": "assets/thumbnail.png",
  "screenshots": [
    "assets/screenshot1.png",
    "assets/screenshot2.png"
  ],
  
  "config": {
    "maxPlayers": 1,
    "avgDuration": 5,
    "difficulty": "easy",
    "orientation": "portrait",
    "minAge": 6
  },
  
  "aiRequirements": {
    "llm": {
      "enabled": true,
      "model": "gpt-3.5-turbo",
      "avgRequests": 10
    },
    "imageGen": {
      "enabled": true,
      "model": "stable-diffusion",
      "avgRequests": 5
    },
    "speech": {
      "enabled": false
    }
  },
  
  "permissions": [
    "user.info",
    "storage",
    "ai.text",
    "ai.image"
  ],
  
  "platform": {
    "web": true,
    "ios": true,
    "android": true
  }
}
```

## 3. 游戏SDK

### 3.1 SDK引入
```html
<!-- 游戏自动注入，无需手动引入 -->
<script src="/sdk/game-sdk.js"></script>
```

### 3.2 SDK使用示例

#### 获取用户信息
```javascript
// 获取当前用户
const user = await GameSDK.getUser();
console.log(user.id, user.nickname, user.avatar);

// 检查登录状态
if (GameSDK.isLoggedIn()) {
  // 已登录
}

// 主动登录（如需要）
const loggedIn = await GameSDK.login();
```

#### AI文本生成
```javascript
// 文本生成
const text = await GameSDK.ai.generateText({
  prompt: "生成一个成语",
  maxTokens: 50,
  temperature: 0.7
});

// 对话补全
const response = await GameSDK.ai.chat({
  messages: [
    { role: "system", content: "你是一个游戏NPC" },
    { role: "user", content: "你好" }
  ]
});

// 流式输出
GameSDK.ai.streamText({
  prompt: "讲一个故事",
  onChunk: (chunk) => {
    console.log(chunk);
  },
  onComplete: (fullText) => {
    console.log("完成", fullText);
  }
});
```

#### AI图像生成
```javascript
// 生成图像
const imageUrl = await GameSDK.ai.generateImage({
  prompt: "一只可爱的猫咪",
  size: "512x512",
  style: "cartoon"
});

// 生成带控制的图像
const image = await GameSDK.ai.generateImage({
  prompt: "风景画",
  negativePrompt: "人物,建筑",
  width: 1024,
  height: 768,
  steps: 30,
  cfgScale: 7.5
});
```

#### 语音能力
```javascript
// 文字转语音
const audioUrl = await GameSDK.ai.textToSpeech({
  text: "欢迎来到游戏世界",
  voice: "zh-CN-XiaoxiaoNeural",
  speed: 1.0
});

// 语音转文字
const text = await GameSDK.ai.speechToText({
  audio: audioBlob,
  language: "zh-CN"
});
```

#### 本地存储
```javascript
// 保存游戏数据
await GameSDK.storage.save({
  level: 5,
  score: 1000,
  items: ["sword", "shield"]
});

// 加载游戏数据
const data = await GameSDK.storage.load();

// 清除数据
await GameSDK.storage.clear();

// 按key存储
await GameSDK.storage.setItem("lastLevel", 5);
const level = await GameSDK.storage.getItem("lastLevel");
```

#### 社交功能
```javascript
// 分享
await GameSDK.social.share({
  title: "我在AI画图猜词得了100分！",
  description: "快来挑战我吧",
  imageUrl: "https://...",
  link: "https://..."
});

// 邀请好友
const friends = await GameSDK.social.inviteFriends({
  title: "一起来玩游戏",
  minCount: 1,
  maxCount: 3
});

// 获取好友列表
const friends = await GameSDK.social.getFriends();

// 发送消息给好友
await GameSDK.social.sendMessage({
  to: friendId,
  type: "text",
  content: "一起来玩吧"
});
```

#### 支付功能
```javascript
// 查询商品
const products = await GameSDK.payment.getProducts();

// 购买商品
const result = await GameSDK.payment.purchase({
  productId: "vip_1month",
  quantity: 1
});

if (result.success) {
  console.log("购买成功", result.orderId);
}
```

#### 数据上报
```javascript
// 上报自定义事件
GameSDK.analytics.track("game_start", {
  level: 1,
  mode: "normal"
});

GameSDK.analytics.track("game_finish", {
  level: 1,
  score: 100,
  duration: 60
});

// 设置用户属性
GameSDK.analytics.setUserProperty("vip_level", 1);
```

#### 排行榜
```javascript
// 提交分数
await GameSDK.leaderboard.submitScore({
  score: 1000,
  extraData: { level: 5 }
});

// 获取排行榜
const board = await GameSDK.leaderboard.getRanking({
  type: "global", // global, friends
  limit: 100
});

// 获取用户排名
const myRank = await GameSDK.leaderboard.getMyRank();
```

## 4. 游戏生命周期

### 4.1 生命周期钩子
```javascript
// 游戏入口文件需要导出以下函数
window.GameLifecycle = {
  // SDK初始化完成，游戏可以开始加载
  onInit: async function(config) {
    console.log("游戏初始化", config);
    // config包含游戏配置信息
  },
  
  // 游戏加载资源
  onLoad: async function() {
    console.log("开始加载资源");
    await loadGameAssets();
  },
  
  // 游戏开始
  onStart: function() {
    console.log("游戏开始");
    startGame();
  },
  
  // 游戏暂停（用户切换标签页或最小化浏览器）
  onPause: function() {
    console.log("游戏暂停");
    pauseGame();
  },
  
  // 游戏恢复
  onResume: function() {
    console.log("游戏恢复");
    resumeGame();
  },
  
  // 游戏结束（用户主动退出或游戏完成）
  onFinish: function(result) {
    console.log("游戏结束", result);
    // result: { score, duration, data }
    return {
      score: 100,
      achievements: ["first_win"]
    };
  },
  
  // 游戏销毁
  onDestroy: function() {
    console.log("游戏销毁");
    cleanupResources();
  }
};
```

### 4.2 生命周期流程
```
onInit → onLoad → onStart → [onPause ↔ onResume] → onFinish → onDestroy
```

## 5. UI设计规范

### 5.1 设计原则
- 简洁直观
- 响应式设计
- 无障碍访问
- 流畅动画（60fps）

### 5.2 尺寸规范
| 平台 | 尺寸 | 说明 |
|------|------|------|
| 手机 | 375x667 (最小) | 设计基准 |
| 平板 | 768x1024 | 自适应 |
| PC | 1200x800 | 居中显示 |

### 5.3 安全区域
```css
/* 避免刘海屏遮挡 */
.game-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

## 6. 性能要求

### 6.1 加载性能
- 首屏加载 < 3秒
- 游戏包大小 < 5MB
- 图片资源使用WebP格式
- 启用资源压缩

### 6.2 运行性能
- 帧率 ≥ 30fps
- 内存占用 < 200MB
- CPU占用 < 50%
- 无明显卡顿

### 6.3 优化建议
```javascript
// 图片懒加载
const img = new Image();
img.loading = "lazy";
img.src = "assets/large-image.png";

// 资源预加载
GameSDK.preloadAssets([
  "assets/level2.png",
  "assets/level3.png"
]);

// 减少AI请求次数
// 使用缓存策略
const cache = new Map();
async function generateText(prompt) {
  if (cache.has(prompt)) {
    return cache.get(prompt);
  }
  const result = await GameSDK.ai.generateText({ prompt });
  cache.set(prompt, result);
  return result;
}
```

## 7. 安全规范

### 7.1 禁止事项
- 禁止直接调用外部API
- 禁止访问用户隐私数据（需用户授权）
- 禁止注入恶意代码
- 禁止收集用户数据上传外部服务器

### 7.2 内容审核
- 用户生成内容需经过审核
- AI生成内容需过滤敏感词
- 图片内容需审核

```javascript
// 内容审核示例
const isSafe = await GameSDK.moderation.checkText({
  text: userInput
});

if (!isSafe) {
  alert("内容包含敏感信息");
}
```

## 8. 调试与测试

### 8.1 本地开发
```bash
# 安装CLI工具
npm install -g @aigame/cli

# 创建新游戏
aigame create my-game

# 本地运行
aigame dev

# 构建
aigame build

# 上传
aigame upload
```

### 8.2 调试工具
```javascript
// 开启调试模式
GameSDK.debug.enable();

// 查看日志
GameSDK.debug.showLog();

// 模拟用户
GameSDK.debug.mockUser({
  id: "test-user",
  nickname: "测试用户",
  vip: true
});

// 模拟支付
GameSDK.debug.mockPayment(true);
```

## 9. 提交审核

### 9.1 审核流程
```
提交 → 自动检测 → 人工审核 → 审核通过/驳回
```

### 9.2 审核标准
- [ ] 功能完整，无严重bug
- [ ] 无安全隐患
- [ ] 符合内容规范
- [ ] 性能达标
- [ ] UI美观，交互流畅

### 9.3 必填信息
- 游戏名称、描述
- 图标、缩略图
- 截图（至少3张）
- 使用说明
- 隐私政策

## 10. 示例游戏

### 10.1 最小示例
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的游戏</title>
</head>
<body>
  <div id="game"></div>
  <script>
    window.GameLifecycle = {
      async onInit(config) {
        console.log("初始化", config);
      },
      
      async onLoad() {
        document.getElementById("game").innerHTML = "加载中...";
      },
      
      onStart() {
        const game = document.getElementById("game");
        game.innerHTML = `
          <h1>AI猜词游戏</h1>
          <button onclick="startGame()">开始游戏</button>
          <div id="content"></div>
        `;
      },
      
      onPause() {},
      onResume() {},
      onFinish() {},
      onDestroy() {}
    };
    
    async function startGame() {
      const word = await GameSDK.ai.generateText({
        prompt: "生成一个简单的中文词语",
        maxTokens: 10
      });
      
      document.getElementById("content").innerHTML = `
        <p>猜这个词: ${word.split('').map(() => '_').join(' ')}</p>
        <input id="guess" placeholder="输入你的答案">
        <button onclick="checkAnswer('${word}')">提交</button>
      `;
    }
    
    async function checkAnswer(answer) {
      const guess = document.getElementById("guess").value;
      if (guess === answer) {
        alert("恭喜答对了！");
        GameSDK.analytics.track("correct_answer");
      } else {
        alert("再试试！");
      }
    }
  </script>
</body>
</html>
```

## 11. FAQ

**Q: 如何调试AI接口？**
A: 使用 `GameSDK.debug.enable()` 开启调试模式，可在控制台看到所有API调用。

**Q: 游戏包大小限制？**
A: 建议控制在5MB以内，超过需要特殊审批。

**Q: 如何处理网络错误？**
A: SDK会自动处理重试，建议添加友好的错误提示。

**Q: 支持哪些第三方库？**
A: 支持所有标准浏览器库，建议使用CDN加载。

**Q: 如何获取用户授权？**
A: 在manifest.json中声明permissions，首次使用时自动弹窗授权。