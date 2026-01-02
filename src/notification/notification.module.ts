import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { aiClientService } from 'src/shared/apiClient/aiClient'
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
	providers: [NotificationService, aiClientService],
	exports: [NotificationService],
})
export class NotificationModule {}
