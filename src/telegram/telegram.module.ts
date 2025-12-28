// telegram.module.ts
import { Module } from '@nestjs/common'
import { NotificationModule } from '../notification/notification.module'
import { ShoppingModule } from '../shopping/shopping.module'
import { ConfigModule } from '../shared/config/config.module'
import { TelegramService } from './telegram.service'

@Module({
	imports: [ConfigModule, NotificationModule, ShoppingModule],
	providers: [TelegramService],
	exports: [TelegramService],
})
export class TelegramModule {}
