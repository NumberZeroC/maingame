import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema()
export class TwentyQuestionsGame extends Document {
  @Prop({ required: true })
  answer: string

  @Prop({ required: true })
  category: string

  @Prop({ required: true })
  userId: Types.ObjectId

  @Prop({ default: 'playing' })
  status: 'playing' | 'completed' | 'failed'

  @Prop({ default: 0 })
  score: number

  @Prop({ type: [{ question: String, answer: String }], default: [] })
  questions: Array<{ question: string; answer: 'yes' | 'no' | 'unknown' }>

  @Prop({ type: [{ guess: String, correct: Boolean }], default: [] })
  guesses: Array<{ guess: string; correct: boolean }>

  @Prop({ default: 20 })
  questionsRemaining: number

  @Prop({ default: Date.now })
  startedAt: Date

  @Prop()
  completedAt?: Date

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const TwentyQuestionsGameSchema = SchemaFactory.createForClass(TwentyQuestionsGame)