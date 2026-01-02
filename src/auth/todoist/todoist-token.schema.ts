import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type TodoistTokenDocument = TodoistToken & Document

@Schema()
export class TodoistToken {
  @Prop({ required: true, unique: true })
  telegramChatId: string

  @Prop({ required: true })
  accessToken: string

  @Prop({ required: true })
  refreshToken: string

  @Prop({ required: true })
  accessTokenExpiresAt: Date
}

export const TodoistTokenSchema = SchemaFactory.createForClass(TodoistToken)

