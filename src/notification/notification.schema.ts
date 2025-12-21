import { Schema as NestSchema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@NestSchema()
export class NotificationModel extends Document {
	@Prop({ required: true })
	message: string

	@Prop({ type: Date })
	date: Date

	@Prop()
	reminders: Date[]
}

export const NotificationSchema =
	SchemaFactory.createForClass(NotificationModel)
