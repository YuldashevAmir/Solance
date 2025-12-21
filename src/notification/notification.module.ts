import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AIClient } from '../shared/apiClient/AIClient'
import { ConfigModule } from '../shared/config/config.module'
import { NotificationSchema } from './notification.schema'
import { NotificationService } from './notification.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Notification', schema: NotificationSchema },
		]),
		ConfigModule,
	],
	providers: [NotificationService, AIClient],
	exports: [NotificationService],
})
export class NotificationModule {}
