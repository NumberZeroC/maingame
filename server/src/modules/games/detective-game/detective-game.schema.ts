import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export interface Suspect {
  id: string
  name: string
  occupation: string
  relationship: string
  personality: string
  testimony: string[]
  isCulprit: boolean
  alibi: string
  secrets: string[]
  questioned: boolean
}

export interface Clue {
  id: string
  name: string
  description: string
  location: string
  importance: 'minor' | 'major' | 'critical'
  discovered: boolean
  hints: string[]
}

export interface Conversation {
  suspectId: string
  messages: Array<{ role: 'user' | 'ai'; content: string; timestamp: Date }>
}

@Schema()
export class DetectiveGame extends Document {
  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  scenario: string

  @Prop({ required: true })
  victimName: string

  @Prop({ required: true })
  location: string

  @Prop({ type: [Object], required: true })
  suspects: Suspect[]

  @Prop({ type: [Object], required: true })
  clues: Clue[]

  @Prop({ required: true })
  culpritId: string

  @Prop({ required: true })
  solution: string

  @Prop({ required: true })
  userId: Types.ObjectId

  @Prop({ default: 'playing' })
  status: 'playing' | 'investigating' | 'solved' | 'failed'

  @Prop({ default: 100 })
  investigationPoints: number

  @Prop({ type: [Object], default: [] })
  conversations: Conversation[]

  @Prop({ type: [String], default: [] })
  discoveredClues: string[]

  @Prop({ type: [{ statement: String, timestamp: Date, correct: Boolean }] })
  deductions: Array<{ statement: string; timestamp: Date; correct: boolean }>

  @Prop({ type: Object, default: null })
  finalAccusation?: {
    suspectId: string
    reasoning: string
    timestamp: Date
    correct: boolean
  }

  @Prop({ default: 0 })
  score: number

  @Prop({ default: 3 })
  maxQuestionsPerSuspect: number

  @Prop({ default: Date.now })
  startedAt: Date

  @Prop()
  completedAt?: Date

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const DetectiveGameSchema = SchemaFactory.createForClass(DetectiveGame)