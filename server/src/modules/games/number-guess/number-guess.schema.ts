import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema()
export class NumberGuessGame extends Document {
  @Prop({ required: true })
  targetNumber: number

  @Prop({ required: true, default: 1 })
  minRange: number

  @Prop({ required: true, default: 100 })
  maxRange: number

  @Prop({ required: true })
  userId: Types.ObjectId

  @Prop({ default: 'playing' })
  status: 'playing' | 'completed' | 'timeout'

  @Prop({ default: 0 })
  score: number

  @Prop({ default: 0 })
  attempts: number

  @Prop({ type: [{ value: Number, result: String }], default: [] })
  guesses: Array<{ value: number; result: 'higher' | 'lower' | 'correct' }>

  @Prop({ default: 60 })
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

export const NumberGuessGameSchema = SchemaFactory.createForClass(NumberGuessGame)