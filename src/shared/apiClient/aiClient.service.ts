import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '../config/config.service'

@Injectable()
export class aiClientService {
	private readonly logger = new Logger(aiClientService.name)

	private apiKey: string
	private apiUrl: string
	private aiModel: string
	private GMT_OFFSET: number

	constructor(private readonly configService: ConfigService) {
		this.apiKey = this.configService.get('AI_API_KEY')!
		this.apiUrl = this.configService.get('AI_API_URL')!
		this.aiModel = this.configService.get('AI_API_MODEL')!
		this.GMT_OFFSET = Number(this.configService.getTimeZone())

		if (!this.apiKey || !this.apiUrl || !this.aiModel) {
			this.logger.error(
				`AI API configuration missing: key=${!!this.apiKey}, url=${!!this.apiUrl}, model=${!!this.aiModel}`
			)
			throw new Error('AI API key, URL, or model is missing!')
		}
		this.logger.log('AI Client initialized successfully')
	}

	async getAIResponse(
		userMessage: string,
		prompt: string
	): Promise<string | null> {
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
							content: `${prompt}\ГUser timezone is ${this.GMT_OFFSET} \nUser Message: ${userMessage}`,
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
