import { INotification } from '../../notification/notification.types'

export function getFormattedText(notificationDto: INotification): string {
	const reminderTimes = notificationDto?.reminders
		.map((time: Date) => {
			return `- ${new Date(time).toLocaleString()}`
		})
		.join('\n')

	return `✅ <b>${notificationDto?.message}</b>\n
<b>${new Date(notificationDto?.date).toLocaleString()}</b>\n
Напоминания:
${reminderTimes}\n`
}
