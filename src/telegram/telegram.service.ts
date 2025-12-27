import { Injectable, OnModuleInit } from '@nestjs/common'
import { Telegraf } from 'telegraf'
import { NotificationService } from '../notification/notification.service'
import { ConfigService } from '../shared/config/config.service'
import { getFormattedText } from '../shared/utils/textFormat.util'

@Injectable()
export class TelegramService implements OnModuleInit {
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
				console.log('ctx message date: ', ctx.message.date)
				console.log('Server Date: ', Date.now())
				const gmtOffset = Math.round(
					(Date.now() / 1000 - ctx.message.date) / 3600
				)
				const chatId = ctx.chat.id.toString()
				const userMessage = ctx.message.text
				const addedNotification =
					await this.notificationService.addNotification(
						userMessage,
						chatId,
						gmtOffset
					)

				const message = getFormattedText(addedNotification)
				try {
					await ctx.reply(message, { parse_mode: 'HTML' })
				} catch (jsonError) {
					console.error('Error parsing AI response as JSON:', jsonError)
					ctx.reply(
						'Ответ ИИ не может быть обработан как JSON. Пожалуйста, убедитесь, что формат правильный.'
					)
				}
			} catch (error) {
				console.error('Error in fetching AI response:', error)
				ctx.reply('Извините, что-то пошло не так.')
			}
		})

		this.bot
			.launch()
			.then(() => {
				console.log('Bot started...')
			})
			.catch(err => {
				console.error('Error launching the bot: ', err)
			})
	}

	stopBot() {
		this.bot.stop('SIGINT')
	}

	async sendMessage(chatId: string, text: string) {
		await this.bot.telegram.sendMessage(chatId, text)
	}
}
