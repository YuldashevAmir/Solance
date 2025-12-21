import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { NotificationModule } from './notification/notification.module'
import { ConfigModule } from './shared/config/config.module'
import { TelegramModule } from './telegram/telegram.module'

@Module({
	imports: [
		ConfigModule,
		TelegramModule,
		NotificationModule,
		MongooseModule.forRoot('mongodb://localhost:27017/solace'),
	],
	providers: [],
})
export class AppModule {}
