import { Module } from '@nestjs/common'
import { ShoppingModule } from 'src/shopping/shopping.module'
import { NotificationModule } from '../notification/notification.module'
import { ConfigModule } from '../shared/config/config.module'
import { TelegramService } from './telegram.service'

@Module({
	imports: [ConfigModule, NotificationModule, ShoppingModule],
	providers: [TelegramService],
	exports: [TelegramService],
})
export class TelegramModule {}
