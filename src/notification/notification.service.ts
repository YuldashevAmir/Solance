import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ConfigService } from 'src/shared/config/config.service'
import { gmtToUTC } from 'src/shared/utils/date.util'
import { aiClientService } from '../shared/apiClient/aiClient.service'
import { Notification } from './notification.schema'
import { INotification } from './notification.types'

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name)
	private GMT_OFFSET: number

	constructor(
		@InjectModel(Notification.name)
		private configService: ConfigService,
		private readonly notificationModel: Model<Notification>,
		private readonly aiClient: aiClientService
	) {
		this.GMT_OFFSET = Number(this.configService.getTimeZone())
	}

	async addNotification(
		userMessage: string,
		chatId: string
	): Promise<INotification> {
		this.logger.log(`Processing notification request for chat ${chatId}`)

		const aiResponse = await this.aiClient.getAIResponse(userMessage)

		if (!aiResponse) {
			this.logger.error(`Failed to get AI response for chat ${chatId}`)
			throw new Error('Failed to get a valid response from AI service')
		}

		const parsedAiResponse =
			typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse

		const notification = {
			...parsedAiResponse,
			chatId,
			reminders: parsedAiResponse.reminders.map((reminder: Date | string) =>
				gmtToUTC(reminder, this.GMT_OFFSET)
			),
		}

		await this.notificationModel.insertOne(notification)
		this.logger.log(
			`Notification saved for chat ${chatId}: ${notification.message}`
		)

		return notification
	}

	async findAll(): Promise<Notification[]> {
		return this.notificationModel.find().exec()
	}
}
