import { Module } from '@nestjs/common'
import { NotificationModule } from '../notification/notification.module'
import { ConfigModule } from '../shared/config/config.module'
import { TelegramService } from './telegram.service'

@Module({
	imports: [ConfigModule, NotificationModule],
	providers: [TelegramService],
	exports: [TelegramService],
})
export class TelegramModule {}
