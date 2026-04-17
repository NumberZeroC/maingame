import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { connect } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { User } from '../src/modules/users/user.entity'
import { config } from 'dotenv'

config()

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
  ]

  for (const gameData of games) {
    const existing = await GameModel.findOne({ slug: gameData.slug })
    if (existing) {
      console.log(`Game ${gameData.slug} already exists, skipping...`)
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
