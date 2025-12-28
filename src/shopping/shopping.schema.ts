import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'

const ShoppingItemSchema = new MongooseSchema(
	{
		message: { type: String, required: true },
		bought: { type: Boolean, default: false },
	},
	{ _id: false }
)

@Schema({ timestamps: true })
export class Shopping extends Document {
	@Prop({ default: false })
	completed: boolean

	@Prop({ required: true, type: Date })
	validTo: Date

	@Prop({ type: [ShoppingItemSchema], default: [] })
	items: Array<{
		message: string
		bought: boolean
	}>

	@Prop({ required: true })
	chatId: string
}

export const ShoppingSchema = SchemaFactory.createForClass(Shopping)
