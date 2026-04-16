import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Types } from 'mongoose'

@Schema()
export class Game extends Document {
  @Prop({ required: true })
  name: string

  @Prop()
  description: string

  @Prop({ type: [String] })
  category: string[]

  @Prop()
  version: string

  @Prop()
  thumbnail: string

  @Prop()
  banner: string

  @Prop()
  entry: string

  @Prop({ type: Object })
  config: Record<string, any>

  @Prop({ type: Object })
  aiRequirements: Record<string, any>

  @Prop({ default: 'draft' })
  status: string

  @Prop({ type: Object, default: { playCount: 0, likeCount: 0, rating: 0 } })
  stats: Record<string, any>

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const GameSchema = SchemaFactory.createForClass(Game)
