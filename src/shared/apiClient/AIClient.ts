import { Injectable } from '@nestjs/common'
import { INotification } from '../../notification/notification.types'
import { ConfigService } from '../config/config.service'

@Injectable()
export class AIClient {
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
			console.log(this.apiKey, this.apiUrl, this.aiModel, this.aiPrompt)
			throw new Error('AI API key, URL, model, or prompt is missing!')
		}
	}

	async getAIResponse(
		userMessage: string,
		chatId: string
	): Promise<INotification | null> {
		try {
			const response = await fetch(this.apiUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'nvidia/nemotron-3-nano-30b-a3b:free',
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
			const aiMessage = data.choices?.[0]?.message?.content

			const parsedData =
				typeof aiMessage === 'string' ? JSON.parse(aiMessage) : aiMessage

			parsedData.chatId = chatId

			return parsedData || null
		} catch (error) {
			console.error('Error in AIClient getAIResponse:', error)
			return null
		}
	}
}
