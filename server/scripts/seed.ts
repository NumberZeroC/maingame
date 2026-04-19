import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { connect } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { User } from '../src/modules/users/user.entity'
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../../.env') })

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ai_game_platform',
  synchronize: false,
  entities: [__dirname + '/../src/modules/**/*.entity{.ts,.js}'],
})

async function seedUsers() {
  const users = [
    {
      phone: '13800138001',
      password: 'Demo1234',
      nickname: '玩家小明',
      avatar: '',
      vipLevel: 2,
      coins: 1000,
    },
    {
      phone: '13800138002',
      password: 'Demo1234',
      nickname: '玩家小红',
      avatar: '',
      vipLevel: 1,
      coins: 500,
    },
    {
      phone: '13800138003',
      password: 'Demo1234',
      nickname: '玩家小刚',
      avatar: '',
      vipLevel: 3,
      coins: 2000,
    },
    {
      phone: '13800138004',
      password: 'Demo1234',
      nickname: '玩家小丽',
      avatar: '',
      vipLevel: 1,
      coins: 300,
    },
    {
      phone: '13800138005',
      password: 'Demo1234',
      nickname: '玩家小龙',
      avatar: '',
      vipLevel: 2,
      coins: 800,
    },
  ]

  for (const userData of users) {
    const existing = await AppDataSource.manager.findOne(User, { where: { phone: userData.phone } })
    if (existing) {
      console.log(`User ${userData.phone} already exists, skipping...`)
      continue
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = AppDataSource.manager.create(User, {
      ...userData,
      password: hashedPassword,
    })
    await AppDataSource.manager.save(user)
    console.log(`Created user: ${userData.nickname} (${userData.phone})`)
  }
}

async function seedGames(mongooseConnection: any) {
  const GameModel =
    mongooseConnection.models.Game ||
    mongooseConnection.model(
      'Game',
      new mongooseConnection.Schema({
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: String,
        category: [String],
        version: { type: String, default: '1.0.0' },
        thumbnail: String,
        banner: String,
        entry: { type: String, required: true },
        manifest: Object,
        assets: Object,
        aiRequirements: Object,
        status: {
          type: String,
          enum: ['draft', 'reviewing', 'published', 'deprecated'],
          default: 'draft',
        },
        publishedAt: Date,
        stats: { type: Object, default: {} },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      })
    )

  const games = [
    {
      name: 'AI画图猜词',
      slug: 'draw-guess',
      description: 'AI生成趣味图像，考验你的想象力！根据AI绘制的图像，猜出对应的词语。',
      category: ['休闲', '益智', 'AI'],
      version: '1.0.0',
      thumbnail: 'https://picsum.photos/seed/draw-guess/400/300',
      banner: 'https://picsum.photos/seed/draw-guess-banner/800/400',
      entry: '/games/draw-guess/index.html',
      status: 'published',
      publishedAt: new Date(),
      stats: { playCount: 0, avgDuration: 0, avgScore: 0, likeCount: 0, rating: 4.8 },
      manifest: {
        id: 'draw-guess',
        slug: 'draw-guess',
        name: 'AI画图猜词',
        version: '1.0.0',
        entry: '/games/draw-guess/index.html',
        thumbnail: 'https://picsum.photos/seed/draw-guess/400/300',
        banner: 'https://picsum.photos/seed/draw-guess-banner/800/400',
        description: 'AI生成趣味图像，考验你的想象力！',
        category: ['休闲', '益智', 'AI'],
        config: {
          maxPlayers: 1,
          avgDuration: 5,
          difficulty: 'easy',
          orientation: 'portrait',
          minAge: 6,
        },
        aiRequirements: {
          llm: { enabled: true, model: 'qwen3-coder-plus', avgRequests: 5 },
          imageGen: { enabled: true, model: 'default', avgRequests: 10 },
          speech: { enabled: false },
        },
        permissions: ['user.info', 'storage', 'ai.text', 'ai.image'],
      },
      aiRequirements: {
        llm: { enabled: true, model: 'qwen3-coder-plus', avgRequests: 5 },
        imageGen: { enabled: true },
        speech: { enabled: false },
      },
    },
    {
      name: '猜数字',
      slug: 'number-guess',
      description: '经典数字猜谜游戏！AI想一个数字，你来猜。每次猜测会提示大了还是小了。',
      category: ['益智', '休闲', '经典'],
      version: '1.0.0',
      thumbnail: 'https://picsum.photos/seed/number-guess/400/300',
      banner: 'https://picsum.photos/seed/number-guess-banner/800/400',
      entry: '/games/number-guess/index.html',
      status: 'published',
      publishedAt: new Date(),
      stats: { playCount: 0, avgDuration: 0, avgScore: 0, likeCount: 0, rating: 4.5 },
      manifest: {
        id: 'number-guess',
        slug: 'number-guess',
        name: '猜数字',
        version: '1.0.0',
        entry: '/games/number-guess/index.html',
        thumbnail: 'https://picsum.photos/seed/number-guess/400/300',
        description: '经典数字猜谜游戏！',
        category: ['益智', '休闲', '经典'],
        config: {
          maxPlayers: 1,
          avgDuration: 3,
          difficulty: 'easy',
          orientation: 'portrait',
          minAge: 6,
        },
        aiRequirements: {
          llm: { enabled: false },
          imageGen: { enabled: false },
          speech: { enabled: false },
        },
        permissions: ['user.info', 'storage'],
      },
      aiRequirements: {
        llm: { enabled: false },
        imageGen: { enabled: false },
        speech: { enabled: false },
      },
    },
    {
      name: '词语接龙',
      slug: 'word-chain',
      description: '和AI玩词语接龙！后一个词的首字必须是前一个词的末字，考验你的词汇量！',
      category: ['益智', 'AI', '休闲'],
      version: '1.0.0',
      thumbnail: 'https://picsum.photos/seed/word-chain/400/300',
      banner: 'https://picsum.photos/seed/word-chain-banner/800/400',
      entry: '/games/word-chain/index.html',
      status: 'published',
      publishedAt: new Date(),
      stats: { playCount: 0, avgDuration: 0, avgScore: 0, likeCount: 0, rating: 4.6 },
      manifest: {
        id: 'word-chain',
        slug: 'word-chain',
        name: '词语接龙',
        version: '1.0.0',
        entry: '/games/word-chain/index.html',
        thumbnail: 'https://picsum.photos/seed/word-chain/400/300',
        description: '和AI玩词语接龙！',
        category: ['益智', 'AI', '休闲'],
        config: {
          maxPlayers: 1,
          avgDuration: 5,
          difficulty: 'medium',
          orientation: 'portrait',
          minAge: 8,
        },
        aiRequirements: {
          llm: { enabled: true, model: 'qwen3-coder-plus', avgRequests: 10 },
          imageGen: { enabled: false },
          speech: { enabled: false },
        },
        permissions: ['user.info', 'storage', 'ai.text'],
      },
      aiRequirements: {
        llm: { enabled: true, model: 'qwen3-coder-plus', avgRequests: 10 },
        imageGen: { enabled: false },
        speech: { enabled: false },
      },
    },
    {
      name: 'AI二十问',
      slug: 'twenty-questions',
      description: '经典的二十问游戏！AI想一个东西，你通过提问来猜出它是什么。',
      category: ['益智', 'AI', '休闲'],
      version: '1.0.0',
      thumbnail: 'https://picsum.photos/seed/twenty-questions/400/300',
      banner: 'https://picsum.photos/seed/twenty-questions-banner/800/400',
      entry: '/games/twenty-questions/index.html',
      status: 'published',
      publishedAt: new Date(),
      stats: { playCount: 0, avgDuration: 0, avgScore: 0, likeCount: 0, rating: 4.7 },
      manifest: {
        id: 'twenty-questions',
        slug: 'twenty-questions',
        name: 'AI二十问',
        version: '1.0.0',
        entry: '/games/twenty-questions/index.html',
        thumbnail: 'https://picsum.photos/seed/twenty-questions/400/300',
        description: '经典的二十问游戏！',
        category: ['益智', 'AI', '休闲'],
        config: {
          maxPlayers: 1,
          avgDuration: 10,
          difficulty: 'medium',
          orientation: 'portrait',
          minAge: 8,
        },
        aiRequirements: {
          llm: { enabled: true, model: 'qwen3-coder-plus', avgRequests: 20 },
          imageGen: { enabled: false },
          speech: { enabled: false },
        },
        permissions: ['user.info', 'storage', 'ai.text'],
      },
      aiRequirements: {
        llm: { enabled: true, model: 'qwen3-coder-plus', avgRequests: 20 },
        imageGen: { enabled: false },
        speech: { enabled: false },
      },
    },
    {
      name: 'AI侦探推理',
      slug: 'detective-game',
      description: 'AI生成神秘案件，你扮演侦探通过多轮对话询问嫌疑人、调查线索，最终破解案件！',
      category: ['益智', 'AI', '推理', '多轮'],
      version: '1.0.0',
      thumbnail: 'https://picsum.photos/seed/detective-game/400/300',
      banner: 'https://picsum.photos/seed/detective-game-banner/800/400',
      entry: '/games/detective-game/index.html',
      status: 'published',
      publishedAt: new Date(),
      stats: { playCount: 0, avgDuration: 0, avgScore: 0, likeCount: 0, rating: 4.9 },
      manifest: {
        id: 'detective-game',
        slug: 'detective-game',
        name: 'AI侦探推理',
        version: '1.0.0',
        entry: '/games/detective-game/index.html',
        thumbnail: 'https://picsum.photos/seed/detective-game/400/300',
        description: 'AI生成神秘案件，你来破解！',
        category: ['益智', 'AI', '推理', '多轮'],
        config: {
          maxPlayers: 1,
          avgDuration: 15,
          difficulty: 'medium',
          orientation: 'portrait',
          minAge: 12,
        },
        aiRequirements: {
          llm: { enabled: true, model: 'qwen3-coder-plus', avgRequests: 30 },
          imageGen: { enabled: false },
          speech: { enabled: false },
        },
        permissions: ['user.info', 'storage', 'ai.text'],
      },
      aiRequirements: {
        llm: { enabled: true, model: 'qwen3-coder-plus', avgRequests: 30 },
        imageGen: { enabled: false },
        speech: { enabled: false },
      },
    },
  ]

  for (const gameData of games) {
    const existing = await GameModel.findOne({ slug: gameData.slug })
    if (existing) {
      console.log(`Game ${gameData.slug} already exists, updating status...`)
      existing.status = 'published'
      existing.manifest = gameData.manifest
      existing.aiRequirements = gameData.aiRequirements
      existing.stats = gameData.stats
      await existing.save()
      continue
    }
    await GameModel.create(gameData)
    console.log(`Created game: ${gameData.name} (${gameData.slug})`)
  }
}

async function seedLeaderboard(mongooseConnection: any) {
  const LeaderboardModel =
    mongooseConnection.models.Leaderboard ||
    mongooseConnection.model(
      'Leaderboard',
      new mongooseConnection.Schema({
        gameId: { type: mongooseConnection.Schema.Types.ObjectId, required: true },
        userId: { type: mongooseConnection.Schema.Types.ObjectId, required: true },
        score: { type: Number, required: true },
        extraData: Object,
        playedAt: Date,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      })
    )

  const GameModel = mongooseConnection.models.Game
  const UserModel = mongooseConnection.models.User

  if (!GameModel || !UserModel) {
    console.log('Game or User model not found, skipping leaderboard seed')
    return
  }

  const game = await GameModel.findOne({ slug: 'draw-guess' })
  if (!game) {
    console.log('Draw-guess game not found, skipping leaderboard seed')
    return
  }

  const users = await AppDataSource.manager.find(User)
  if (users.length === 0) {
    console.log('No users found, skipping leaderboard seed')
    return
  }

  const leaderboardEntries = [
    { userId: users[0]?.id, score: 9500 },
    { userId: users[1]?.id, score: 8800 },
    { userId: users[2]?.id, score: 7200 },
    { userId: users[3]?.id, score: 5500 },
    { userId: users[4]?.id, score: 3800 },
  ]

  for (const entry of leaderboardEntries) {
    if (!entry.userId) continue
    const existing = await LeaderboardModel.findOne({ gameId: game._id, userId: entry.userId })
    if (existing) {
      console.log(`Leaderboard entry for user ${entry.userId} already exists, skipping...`)
      continue
    }
    await LeaderboardModel.create({
      gameId: game._id,
      userId: entry.userId,
      score: entry.score,
      playedAt: new Date(),
    })
    console.log(`Created leaderboard entry: score ${entry.score}`)
  }
}

async function main() {
  console.log('Starting seed...')

  try {
    await AppDataSource.initialize()
    console.log('PostgreSQL connected')

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_game_platform'
    const mongooseConnection = await connect(mongoUri)
    console.log('MongoDB connected')

    await seedUsers()
    await seedGames(mongooseConnection)
    await seedLeaderboard(mongooseConnection)

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  } finally {
    await AppDataSource.destroy()
    process.exit(0)
  }
}

main()
