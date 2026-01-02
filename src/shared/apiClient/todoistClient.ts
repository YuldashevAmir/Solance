import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '../config/config.service'

@Injectable()
export class TodoistClient {
	private readonly logger = new Logger(TodoistClient.name)
	private todoistApiKey: string
	private todoistApiUrl: string = 'https://api.todoist.com/api/v1/tasks'

	constructor(private readonly configService: ConfigService) {
		this.todoistApiKey = this.configService.getTodoistApiKey()
		if (!this.todoistApiKey) {
			this.logger.error('Todoist API Key is not configured.')
			throw new Error('Todoist API Key is missing.')
		}
		this.logger.log('TodoistService initialized successfully.')
	}

	async addTask(taskContent: string, projectId: string): Promise<any> {
		try {
			const response = await fetch(this.todoistApiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.todoistApiKey}`,
				},
				body: JSON.stringify({
					content: taskContent,
					project_id: projectId,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				this.logger.error(
					`Error adding task to Todoist: ${response.status} - ${JSON.stringify(errorData)}`
				)
				throw new Error(
					`Failed to add task to Todoist: ${errorData.error || response.statusText}`
				)
			}

			const data = await response.json()
			this.logger.log(`Task added to Todoist: ${data.content} (ID: ${data.id})`)
			return data
		} catch (error) {
			this.logger.error(
				`Exception when adding task to Todoist: ${error.message}`,
				error.stack
			)
			throw error
		}
	}
}
