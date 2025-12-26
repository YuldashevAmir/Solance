import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AIClient } from '../shared/apiClient/AIClient'
import { ConfigModule } from '../shared/config/config.module'
import { TelegramModule } from '../telegram/telegram.module'
import { NotificationScheduler } from './notification.scheduler'
import { NotificationSchema } from './notification.schema'
import { NotificationService } from './notification.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Notification', schema: NotificationSchema },
		]),
		ConfigModule,
		forwardRef(() => TelegramModule),
	],
	providers: [NotificationService, AIClient, NotificationScheduler],
	exports: [NotificationService],
})
export class NotificationModule {}
