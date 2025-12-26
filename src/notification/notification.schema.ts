import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Notification extends Document {
	@Prop({ required: true })
	message: string

	@Prop({ type: Date })
	date: Date

	@Prop({ type: [Date], required: true })
	reminders: Date[]

	@Prop({ type: [Date], default: [] })
	sentReminders: Date[]

	@Prop({ required: true })
	chatId: string
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
