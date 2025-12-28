import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ConfigService } from 'src/shared/config/config.service'
import { getNearestMonday } from 'src/shared/utils/date.util'
import { aiClientService } from '../shared/apiClient/aiClient.service'
import { Shopping } from './shopping.schema'
import { IShopping, IShoppingItem } from './shopping.types'

@Injectable()
export class ShoppingService {
	private readonly logger = new Logger(ShoppingService.name)
	private GMT_OFFSET: number

	constructor(
		private readonly configService: ConfigService,
		@InjectModel(Shopping.name)
		private readonly shoppingModel: Model<Shopping>,
		private readonly aiClient: aiClientService
	) {
		this.GMT_OFFSET = Number(this.configService.getTimeZone())
	}

	async addShoppingItems(
		userMessage: string,
		chatId: string
	): Promise<IShopping> {
		this.logger.log(`Processing shopping request for chat ${chatId}`)

		const shoppingPrompt = this.configService.getShoppingPrompt()
		const aiResponse = await this.aiClient.getAIResponse(
			userMessage,
			shoppingPrompt
		)

		if (!aiResponse) {
			this.logger.error(`Failed to get AI response for chat ${chatId}`)
			throw new Error('Failed to get a valid response from AI service')
		}

		const parsedAiResponse =
			typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse

		if (!parsedAiResponse.items || !Array.isArray(parsedAiResponse.items)) {
			throw new Error('Invalid AI response structure')
		}

		const validTo = getNearestMonday(this.GMT_OFFSET)

		// Check if shopping list exists for this week
		const existingShopping = await this.shoppingModel.findOne({
			chatId,
			validTo,
		})

		if (existingShopping) {
			// Add items to existing shopping list
			const newItems: IShoppingItem[] = parsedAiResponse.items.map(
				(item: IShoppingItem) => ({
					message: item.message,
					bought: false,
				})
			)

			existingShopping.items.push(...newItems)
			await existingShopping.save()

			this.logger.log(
				`Shopping items added to existing list for chat ${chatId}`
			)

			return existingShopping.toObject()
		} else {
			// Create new shopping list
			const shopping = {
				completed: false,
				validTo,
				items: parsedAiResponse.items.map((item: IShoppingItem) => ({
					message: item.message,
					bought: false,
				})),
				chatId,
			}

			await this.shoppingModel.insertOne(shopping)
			this.logger.log(`Shopping list created for chat ${chatId}`)

			return shopping
		}
	}

	async getShoppingList(chatId: string): Promise<IShopping | null> {
		const validTo = getNearestMonday(this.GMT_OFFSET)

		const shopping = await this.shoppingModel.findOne({
			chatId,
			validTo,
		})

		if (!shopping) {
			return null
		}

		// Filter items to only return unbought items
		const unboughtItems = shopping.items.filter(item => !item.bought)

		return {
			...shopping.toObject(),
			items: unboughtItems,
		}
	}

	async markItemAsBought(
		chatId: string,
		itemMessage: string
	): Promise<IShopping | null> {
		const validTo = getNearestMonday(this.GMT_OFFSET)

		const shopping = await this.shoppingModel.findOne({
			chatId,
			validTo,
		})

		if (!shopping) {
			return null
		}

		const item = shopping.items.find(
			item => item.message === itemMessage && !item.bought
		)

		if (!item) {
			return null
		}

		item.bought = true
		await shopping.save()

		this.logger.log(`Item marked as bought for chat ${chatId}: ${itemMessage}`)

		return shopping.toObject()
	}
}
