import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Model } from 'mongoose'
import { TelegramService } from '../telegram/telegram.service'
import { Notification } from './notification.schema'

@Injectable()
export class NotificationScheduler {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
		private readonly telegramService: TelegramService
	) {}

	@Cron(CronExpression.EVERY_30_SECONDS)
	async handleReminders() {
		const now = new Date()
		const lastMinute = new Date(now.getTime() - 60_000)

		const notifications = await this.notificationModel.find({
			reminders: {
				$elemMatch: { $lte: now, $gte: lastMinute },
			},
		})

		console.log('notifications: ', notifications)

		for (const notification of notifications) {
			const dueReminders = notification.reminders.filter(
				r =>
					r <= now &&
					r >= lastMinute &&
					!notification.sentReminders.some(
						sent => sent.getTime() === r.getTime()
					)
			)

			for (const reminder of dueReminders) {
				try {
					await this.telegramService.sendMessage(
						notification.chatId,
						`⏰ Reminder:\n${notification.message}`
					)

					notification.sentReminders.push(reminder)
				} catch (err) {
					console.log('Error in scheduler', JSON.stringify(err))
				}
			}

			await notification.save()
		}
	}
}
