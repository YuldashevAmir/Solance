import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { getResponseTextForNotification } from 'src/shared/utils/textFormat.util'
import { Telegraf } from 'telegraf'
import { NotificationService } from '../notification/notification.service'
import { ConfigService } from '../shared/config/config.service'
import { ERROR_REASONS } from '../shared/messages/error.message'
import { INFO_MESSAGES } from '../shared/messages/info.messages'

@Injectable()
export class TelegramService implements OnModuleInit {
	private readonly logger = new Logger(TelegramService.name)
	private bot: Telegraf
	private GMT_OFFSET: number

	constructor(
		private configService: ConfigService,
		private notificationService: NotificationService
	) {
		this.GMT_OFFSET = Number(this.configService.getTimeZone())

		const token = this.configService.getTelegramBotToken()
		this.bot = new Telegraf(token)
	}

	onModuleInit() {
		this.bot.start(ctx => {
			ctx.reply(INFO_MESSAGES.WELCOME)
		})

		this.bot.on('text', async ctx => {
			try {
				const chatId = ctx.chat.id.toString()
				const userMessage = ctx.message.text

				let addedNotification = await this.notificationService.addNotification(
					userMessage,
					chatId
				)

				this.logger.log(
					`Notification created for chat ${chatId}: ${addedNotification.message}`
				)

				const message = getResponseTextForNotification(
					addedNotification,
					this.GMT_OFFSET
				)

				try {
					await ctx.reply(message, { parse_mode: 'HTML' })
				} catch (error) {
					this.logger.error('Error parsing AI response as JSON', error.stack)
					throw error
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
