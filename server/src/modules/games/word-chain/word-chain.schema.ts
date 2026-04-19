import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema()
export class WordChainGame extends Document {
  @Prop({ required: true })
  currentWord: string

  @Prop({ required: true })
  lastChar: string

  @Prop({ required: true })
  userId: Types.ObjectId

  @Prop({ default: 'playing' })
  status: 'playing' | 'completed' | 'failed'

  @Prop({ default: 0 })
  score: number

  @Prop({ default: 0 })
  rounds: number

  @Prop({ type: [{ word: String, by: String, valid: Boolean }], default: [] })
  history: Array<{ word: string; by: 'user' | 'ai'; valid: boolean }>

  @Prop({ type: [String], default: [] })
  usedWords: string[]

  @Prop({ default: 30 })
  timeLimit: number

  @Prop({ default: Date.now })
  startedAt: Date

  @Prop()
  completedAt?: Date

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const WordChainGameSchema = SchemaFactory.createForClass(WordChainGame)