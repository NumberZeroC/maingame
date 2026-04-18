# Feature Specifications

## 1. Voice SDK

### API Endpoints

#### Text-to-Speech
```
POST /ai/speech/generate
Body: { text, options?: { voice, speed, format } }
Response: { audioUrl, duration }
```

#### Speech-to-Text
```
POST /ai/speech/recognize
Body: { audioUrl, options?: { language } }
Response: { text, confidence }
```

### SDK Methods
```js
// Text to Speech
const result = await sdk.ai.textToSpeech('Hello world', {
  voice: 'female',  // 'male' | 'female' | 'child'
  speed: 1.0,       // 0.5 - 2.0
  format: 'mp3'     // 'mp3' | 'wav'
})
// Returns: { audioUrl, duration }

// Speech to Text
const result = await sdk.ai.speechToText(audioBlobOrUrl, {
  language: 'zh-CN'
})
// Returns: { text, confidence }
```

### Provider Support
- Aliyun DashScope (primary)
- OpenAI Whisper (backup)

---

## 2. Achievement System

### Data Model
```typescript
interface Achievement {
  _id: string
  gameId: string
  id: string          // achievement identifier
  name: string
  description: string
  icon: string
  type: 'common' | 'rare' | 'epic' | 'legendary'
  condition: {
    type: 'score' | 'count' | 'time' | 'custom'
    value: number
    operator: '>' | '>=' | '=' | '<'
  }
  reward?: {
    coins?: number
    badge?: string
  }
  createdAt: Date
}

interface UserAchievement {
  _id: string
  userId: string
  gameId: string
  achievementId: string
  unlockedAt: Date
  progress?: number
  data?: any
}
```

### API Endpoints
```
GET  /games/:id/achievements          # Game achievements list
GET  /users/me/achievements           # User unlocked achievements
POST /games/:id/achievements/unlock   # Unlock achievement
GET  /users/me/achievements/:id       # Achievement detail
```

### SDK Methods
```js
// Get game achievements
const achievements = await sdk.achievements.getList()

// Unlock achievement
await sdk.achievements.unlock('first_win', { score: 100 })

// Check progress
const progress = await sdk.achievements.getProgress('play_100')
```

### Frontend Display
- Achievement badge component
- Unlock notification
- Profile achievements section
- Game detail achievements list

---

## 3. Social Sharing

### API Endpoints
```
POST /social/share
Body: { type, gameId, data, platforms }
Response: { shareUrl, qrCode }

POST /social/invite
Body: { gameId, message }
Response: { inviteUrl, inviteCode }
```

### SDK Methods
```js
// Share game result
await sdk.social.share('result', {
  score: 100,
  message: '我获得了100分！'
})

// Share game
await sdk.social.share('game', {
  gameId: 'draw-guess'
})

// Invite friends
const invite = await sdk.social.inviteFriends({
  gameId: 'draw-guess',
  message: '来一起玩吧！'
})
// Returns: { inviteUrl, inviteCode }
```

### Share Types
- `game` - Share game to play
- `result` - Share game result/score
- `achievement` - Share unlocked achievement
- `leaderboard` - Share leaderboard position

### Platforms
- WeChat (微信)
- QQ
- Weibo
- Copy link

---

## 4. Streaming AI

### API Endpoints (SSE)
```
POST /ai/text/stream
Body: { prompt, options }
Response: SSE stream with chunks

POST /ai/chat/stream
Body: { messages, options }
Response: SSE stream with chunks
```

### SDK Methods
```js
// Stream text generation
sdk.ai.streamText('Tell me a story', {
  onChunk: (chunk) => {
    console.log('Received:', chunk)
    // Update UI with partial text
  },
  onComplete: (fullText) => {
    console.log('Done:', fullText)
  },
  onError: (error) => {
    console.error(error)
  }
})

// Stream chat
sdk.ai.streamChat([
  { role: 'user', content: 'Hello' }
], {
  onChunk: (chunk) => {},
  onComplete: (response) => {},
  onError: (error) => {}
})
```

### SSE Response Format
```
event: chunk
data: {"text": "Once upon"}

event: chunk
data: {"text": " a time"}

event: done
data: {"fullText": "Once upon a time..."}
```

### Use Cases
- Real-time AI narration
- Interactive storytelling
- AI NPC dialogue
- Progressive content reveal