import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { utcToGMT } from 'src/shared/utils/date.util'
import { Telegraf } from 'telegraf'
import { NotificationService } from '../notification/notification.service'
import { ConfigService } from '../shared/config/config.service'
import { ERROR_REASONS } from '../shared/messages/error.message'
import { INFO_MESSAGES } from '../shared/messages/info.messages'
import { getFormattedText } from '../shared/utils/textFormat.util'

@Injectable()
export class TelegramService implements OnModuleInit {
	private readonly logger = new Logger(TelegramService.name)

	private bot: Telegraf

	constructor(
		private configService: ConfigService,
		private notificationService: NotificationService
	) {
		const token = this.configService.getTelegramBotToken()

		this.bot = new Telegraf(token)
	}

	onModuleInit() {
		this.bot.start(ctx => {
			ctx.reply(this.configService.getTelegramBotStartMessage())
		})

		this.bot.on('text', async ctx => {
			try {
				const GMT_OFFSET = Number(this.configService.getTimeZone())
				const chatId = ctx.chat.id.toString()
				const userMessage = ctx.message.text
				const addedNotification =
					await this.notificationService.addNotification(
						userMessage,
						chatId,
						GMT_OFFSET
					)

				this.logger.log(
					`Notification created for chat ${chatId}: ${addedNotification.message}`
				)

				addedNotification.reminders = addedNotification.reminders.map(
					reminder => utcToGMT(reminder, GMT_OFFSET)
				)

				const message = getFormattedText(addedNotification)
				try {
					await ctx.reply(message, { parse_mode: 'HTML' })
				} catch (jsonError) {
					this.logger.error(
						'Error parsing AI response as JSON',
						jsonError.stack
					)
					ctx.reply(
						'Ответ ИИ не может быть обработан как JSON. Пожалуйста, убедитесь, что формат правильный.'
					)
				}
			} catch (error) {
				this.logger.error('Error in fetching AI response', error.stack)
				ctx.reply(ERROR_REASONS.DEFAULT)
			}
		})

		this.bot
			.launch()
			.then(() => {
				this.logger.log('Telegram bot started successfully')
			})
			.catch(err => {
				this.logger.error('Error launching the Telegram bot', err.stack)
			})
	}

	stopBot() {
		this.bot.stop('SIGINT')
	}

	async sendMessage(chatId: string, text: string) {
		await this.bot.telegram.sendMessage(chatId, text)
	}
}
