import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Model } from 'mongoose'
import { TelegramService } from '../telegram/telegram.service'
import { Notification } from './notification.schema'

@Injectable()
export class NotificationScheduler {
	private readonly logger = new Logger(NotificationScheduler.name)

	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
		private readonly telegramService: TelegramService
	) {}

	@Cron(CronExpression.EVERY_30_SECONDS)
	async handleReminders() {
		const now = new Date()
		const lastMinute = new Date(now.getTime() - 60_000)
		console.log(now, '\n', lastMinute)
		const notifications = await this.notificationModel.find({
			reminders: {
				$elemMatch: {
					$gte: lastMinute,
					$lte: now,
				},
			},
			$expr: {
				$gt: [
					{
						$size: {
							$setDifference: ['$reminders', '$sentReminders'],
						},
					},
					0,
				],
			},
		})
		console.log('******************\n')
		for (const notification of notifications) {
			console.log('Notification:', notification)
			const dueReminders = notification.reminders.filter(
				r =>
					r >= lastMinute &&
					r <= now &&
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

					await this.notificationModel.updateOne(
						{ _id: notification._id },
						{
							$addToSet: { sentReminders: reminder },
						}
					)

					this.logger.log(
						`Reminder sent: ${notification._id} at ${reminder.toISOString()}`
					)
				} catch (error) {
					this.logger.error(
						`Failed to send reminder ${notification._id}`,
						error.stack
					)
				}
			}
		}
		console.log('******************\n')
	}
}
