export interface INotification {
	message: string
	date: Date
	reminders: Date[]
	sentReminders: Date[]
	chatId: string
}
