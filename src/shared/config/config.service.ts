import { Injectable } from '@nestjs/common'
import { ConfigService as NestConfigService } from '@nestjs/config'

@Injectable()
export class ConfigService {
	constructor(private readonly nestConfigService: NestConfigService) {}

	get(key: string): string {
		const value = this.nestConfigService.get<string>(key)

		if (value === undefined) {
			throw new Error(`Environment variable ${key} is not defined`)
		}

		return value
	}

	getTimeZone(): string {
		return this.get('TIME_ZONE')
	}

	getTelegramBotToken(): string {
		return this.get('TELEGRAM_BOT_TOKEN')
	}

	getTelegramBotStartMessage(): string {
		return this.get('TELEGRAM_BOT_START_MESSAGE')
	}

	getAiApiKey(): string {
		return this.get('AI_API_KEY')
	}

	getAiApiModel(): number {
		return Number(this.get('AI_API_MODEL'))
	}

	getAiApiUrl(): string {
		return this.get('AI_API_URL')
	}

	getNotificationPrompt(): string {
		return this.get('NOTIFICATION_PROMPT')
	}

	getShoppingPrompt(): string {
		return this.get('SHOPPING_PROMPT')
	}

	getShoppingProjectId(): string {
		return this.get('TODOIST_SHOPPING_PROJECT_ID')
	}

	getTodoistApiKey(): string {
		return this.get('TODOIST_API_KEY')
	}
}
