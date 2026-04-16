import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class Game extends Document {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string

  @Prop()
  description: string

  @Prop({ type: [String] })
  category: string[]

  @Prop({ default: '1.0.0' })
  version: string

  @Prop()
  thumbnail: string

  @Prop()
  banner: string

  @Prop({ required: true })
  entry: string

  @Prop({ type: Object })
  manifest: {
    id: string
    slug: string
    name: string
    version: string
    entry: string
    thumbnail?: string
    banner?: string
    description?: string
    category?: string[]
    config?: {
      maxPlayers?: number
      avgDuration?: number
      difficulty?: string
      orientation?: string
      minAge?: number
    }
    aiRequirements?: {
      llm?: { enabled: boolean; model?: string; avgRequests?: number }
      imageGen?: { enabled: boolean; model?: string; avgRequests?: number }
      speech?: { enabled: boolean; type?: string }
    }
    permissions?: string[]
    assets?: {
      bundleUrl?: string
      bundleHash?: string
      size?: number
      preload?: string[]
    }
  }

  @Prop({ type: Object })
  assets: {
    bundleUrl?: string
    bundleHash?: string
    size?: number
    preload?: string[]
  }

  @Prop({ type: Object })
  aiRequirements: {
    llm?: { enabled: boolean; model?: string; avgRequests?: number }
    imageGen?: { enabled: boolean; model?: string; avgRequests?: number }
    speech?: { enabled: boolean; type?: string }
  }

  @Prop({ enum: ['draft', 'reviewing', 'published', 'deprecated'], default: 'draft' })
  status: string

  @Prop()
  publishedAt?: Date

  @Prop({ type: Object, default: {} })
  stats: {
    playCount: number
    avgDuration: number
    avgScore: number
    likeCount: number
    rating: number
  }

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const GameSchema = SchemaFactory.createForClass(Game)

@Schema({ timestamps: true })
export class GameSession extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'Game' })
  gameId: Types.ObjectId

  @Prop({ type: Object, default: {} })
  saveData: Record<string, any>

  @Prop({ default: 0 })
  highScore: number

  @Prop({ default: 0 })
  totalPlayTime: number

  @Prop({ type: [String], default: [] })
  achievements: string[]

  @Prop({ default: Date.now })
  lastPlayedAt: Date

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession)

@Schema({ timestamps: true })
export class GamePlayRecord extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'Game' })
  gameId: Types.ObjectId

  @Prop({ required: true })
  sessionId: string

  @Prop({ default: 0 })
  score: number

  @Prop({ default: 0 })
  duration: number

  @Prop({ type: Object })
  data: Record<string, any>

  @Prop({ type: [String], default: [] })
  achievements: string[]

  @Prop({ default: Date.now })
  startedAt: Date

  @Prop()
  finishedAt?: Date

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const GamePlayRecordSchema = SchemaFactory.createForClass(GamePlayRecord)

@Schema({ timestamps: true })
export class Leaderboard extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Game' })
  gameId: Types.ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId

  @Prop({ required: true })
  score: number

  @Prop({ type: Object })
  extraData: Record<string, any>

  @Prop()
  playedAt?: Date

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard)

LeaderboardSchema.index({ gameId: 1, score: -1 })
LeaderboardSchema.index({ gameId: 1, userId: 1 }, { unique: true })
