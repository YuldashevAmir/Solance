import { Injectable, Logger } from '@nestjs/common'
import { INotification } from '../../notification/notification.types'
import { ConfigService } from '../config/config.service'

@Injectable()
export class aiClientService {
	private readonly logger = new Logger(aiClientService.name)

	private apiKey: string
	private apiUrl: string
	private aiModel: string
	private aiPrompt: string

	constructor(private readonly configService: ConfigService) {
		this.apiKey = this.configService.get('AI_API_KEY')!
		this.apiUrl = this.configService.get('AI_API_URL')!
		this.aiModel = this.configService.get('AI_API_MODEL')!
		this.aiPrompt = this.configService.get('AI_API_PROMPT')!

		if (!this.apiKey || !this.apiUrl || !this.aiModel || !this.aiPrompt) {
			this.logger.error(
				`AI API configuration missing: key=${!!this.apiKey}, url=${!!this.apiUrl}, model=${!!this.aiModel}, prompt=${!!this.aiPrompt}`
			)
			throw new Error('AI API key, URL, model, or prompt is missing!')
		}
		this.logger.log('AI Client initialized successfully')
	}

	async getAIResponse(userMessage: string): Promise<INotification | null> {
		try {
			const response = await fetch(this.apiUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: this.aiModel,
					messages: [
						{
							role: 'user',
							content: `${this.aiPrompt}\nToday is ${new Date().toISOString().split('T')[0]} \nUser Message: ${userMessage}`,
						},
					],
					reasoning: { enabled: true },
				}),
			})

			const data = await response.json()
			const aiResponse = data.choices?.[0]?.message?.content

			return aiResponse || null
		} catch (error) {
			this.logger.error('Error in AI Client getAIResponse', error.stack)
			return null
		}
	}
}
