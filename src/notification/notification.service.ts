import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { aiClientService } from '../shared/apiClient/aiClient.service'
import { Notification } from './notification.schema'
import { INotification } from './notification.types'

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name)

	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
		private readonly aiClient: aiClientService
	) {}

	async addNotification(
		userMessage: string,
		chatId: string,
		GMT_OFFSET: number
	): Promise<INotification> {
		this.logger.log(`Processing notification request for chat ${chatId}`)

		const notificationDto = await this.aiClient.getAIResponse(
			userMessage,
			chatId,
			GMT_OFFSET
		)

		if (!notificationDto) {
			this.logger.error(`Failed to get AI response for chat ${chatId}`)
			throw new Error('Failed to get a valid response from AI service')
		}

		await this.notificationModel.insertOne(notificationDto)
		this.logger.log(`Notification saved for chat ${chatId}: ${notificationDto.message}`)

		return notificationDto
	}

	async findAll(): Promise<Notification[]> {
		return this.notificationModel.find().exec()
	}
}
