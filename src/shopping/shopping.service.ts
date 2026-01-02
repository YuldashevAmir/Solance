import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from 'src/shared/config/config.service'
import { extractFirstJson } from 'src/shared/utils/textFormat.util'
import { aiClientService } from '../shared/apiClient/aiClient'
import { TodoistClient } from '../shared/apiClient/todoistClient'

@Injectable()
export class ShoppingService {
	private readonly logger = new Logger(ShoppingService.name)

	private PROJECT_ID: string

	constructor(
		private readonly configService: ConfigService,
		private readonly aiClient: aiClientService,
		private readonly todoistClient: TodoistClient
	) {
		this.PROJECT_ID = this.configService.getShoppingProjectId()
	}

	async addShoppingItems(
		userMessage: string,
		chatId: string
	): Promise<string[]> {
		this.logger.log(`Processing shopping items request for chat ${chatId}`)

		const shoppingPrompt = this.configService.getShoppingPrompt()
		const aiResponse = await this.aiClient.getAIResponse(
			userMessage,
			shoppingPrompt
		)

		if (!aiResponse) {
			this.logger.error(`Failed to get AI response for chat ${chatId}`)
			throw new Error('Failed to get a valid response from AI service')
		}

		const parsedAiResponse: { items: { bought: boolean; message: string }[] } =
			typeof aiResponse === 'string' ? extractFirstJson(aiResponse) : aiResponse

		const addedItems: string[] = []

		for (const item of parsedAiResponse.items) {
			await this.todoistClient.addTask(item.message, this.PROJECT_ID)
			addedItems.push(item.message)
			this.logger.log(`Shopping item saved for chat ${chatId}: ${item}`)
		}

		return addedItems
	}
}
