# AI Game Platform - Development Roadmap

## Completed Features

### Core Platform
- [x] User authentication (JWT)
- [x] Game listing and details
- [x] Game runtime (iframe + SDK)
- [x] AI text generation
- [x] AI image generation
- [x] Game session storage
- [x] Leaderboard system
- [x] Multi-provider AI fallback

### SDK
- [x] User info API
- [x] AI generateText
- [x] AI generateImage
- [x] Storage (save/load/clear)
- [x] Leaderboard submit/get
- [x] Analytics track

## In Progress

### Voice SDK (Priority: HIGH)
- [ ] Backend: POST /ai/speech/generate (TTS)
- [ ] Backend: POST /ai/speech/recognize (STT)
- [ ] SDK: ai.textToSpeech(text, options)
- [ ] SDK: ai.speechToText(audioUrl, options)
- [ ] Provider: Aliyun DashScope TTS/STT

### Achievement System (Priority: HIGH)
- [ ] Backend: Achievement schema (MongoDB)
- [ ] Backend: POST /achievements/unlock
- [ ] Backend: GET /achievements
- [ ] Backend: GET /achievements/:id
- [ ] SDK: achievements.unlock(id, data)
- [ ] SDK: achievements.getList()
- [ ] Frontend: Achievement display component

### Social Sharing (Priority: HIGH)
- [ ] Backend: POST /social/share
- [ ] Backend: POST /social/invite
- [ ] SDK: social.share(type, data)
- [ ] SDK: social.inviteFriends()
- [ ] Frontend: Share buttons

### Streaming AI (Priority: HIGH)
- [ ] Backend: POST /ai/text/stream (SSE)
- [ ] Backend: POST /ai/chat/stream (SSE)
- [ ] SDK: ai.streamText(prompt, { onChunk, onComplete })
- [ ] SDK: ai.streamChat(messages, { onChunk, onComplete })

## Planned Features

### Social/Friends
- [ ] Friends system (add/remove/list)
- [ ] Friend leaderboard
- [ ] In-game chat
- [ ] Real-time matching

### Payment
- [ ] Virtual currency
- [ ] Product catalog
- [ ] Purchase flow
- [ ] Transaction history

### Enhanced Analytics
- [ ] User profile
- [ ] Retention analysis
- [ ] Funnel tracking
- [ ] AI cost per game

### Game Development
- [ ] CLI tool (create/dev/upload)
- [ ] Debug panel
- [ ] Game templates (Phaser, Pixi)
- [ ] Hot update mechanism

### Multi-save
- [ ] Save slots API
- [ ] Auto-save
- [ ] Cloud sync

### Content Moderation
- [ ] Text moderation API
- [ ] Image moderation API
- [ ] User reporting

### Voice Enhancement
- [ ] Voice chat
- [ ] AI NPC voice
- [ ] Background music generation

## Implementation Order

1. Voice SDK + Streaming AI (AI capability expansion)
2. Achievement System (User engagement)
3. Social Sharing (Viral growth)
4. Payment System (Monetization)
5. Friends System (Social features)
6. Game Templates (Developer tools)