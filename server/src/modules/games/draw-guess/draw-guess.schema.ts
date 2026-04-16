import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema()
export class DrawGuessGame extends Document {
  @Prop({ required: true })
  word: string

  @Prop({ required: true })
  category: string

  @Prop({ required: true })
  imageUrl: string

  @Prop({ required: true })
  userId: Types.ObjectId

  @Prop({ default: 'playing' })
  status: 'playing' | 'completed' | 'timeout'

  @Prop({ default: 0 })
  score: number

  @Prop({ default: 0 })
  attempts: number

  @Prop({ type: [String], default: [] })
  guesses: string[]

  @Prop({ default: 60 })
  timeLimit: number

  @Prop({ default: 60 })
  timeRemaining: number

  @Prop({ default: Date.now })
  startedAt: Date

  @Prop()
  completedAt?: Date

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const DrawGuessGameSchema = SchemaFactory.createForClass(DrawGuessGame)
