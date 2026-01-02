import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { getResponseTextForNotification } from 'src/shared/utils/textFormat.util'
import { Telegraf } from 'telegraf'
import { NotificationService } from '../notification/notification.service'
import { ConfigService } from '../shared/config/config.service'
import { ERROR_REASONS } from '../shared/messages/error.message'
import { INFO_MESSAGES } from '../shared/messages/info.messages'

import { ShoppingService } from './../shopping/shopping.service'

@Injectable()
export class TelegramService implements OnModuleInit {
	private readonly logger = new Logger(TelegramService.name)
	private bot: Telegraf
	private GMT_OFFSET: number

	constructor(
		private configService: ConfigService,
		private notificationService: NotificationService,
		private shoppingService: ShoppingService
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
				const lowerText = userMessage.trim().toLowerCase()

				switch (true) {
					case lowerText.startsWith('б '):
						await this.handleShoppingRequest(ctx, chatId, userMessage)
						break
					default:
						await this.processNotification(ctx, chatId, userMessage)
				}
			} catch (error) {
				this.logger.error('Error processing user message', error.stack)
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

	private async handleShoppingRequest(
		ctx: any,
		chatId: string,
		userMessage: string
	) {
		let addedShoppingItems = await this.shoppingService.addShoppingItems(
			userMessage,
			chatId
		)
		this.logger.log(
			`Shopping items created for chat ${chatId}: ${addedShoppingItems.join('')}`
		)
		const message = addedShoppingItems.join('\n')

		try {
			await ctx.reply(message, { parse_mode: 'HTML' })
		} catch (error) {
			this.logger.error('Error parsing AI response as JSON', error.stack)
			throw error
		}
	}

	private async processNotification(
		ctx: any,
		chatId: string,
		userMessage: string
	) {
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
	}

	stopBot() {
		this.bot.stop('SIGINT')
	}

	async sendMessage(chatId: string, text: string) {
		await this.bot.telegram.sendMessage(chatId, text)
	}
}
