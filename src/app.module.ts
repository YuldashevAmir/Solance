import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'
import { NotificationModule } from './notification/notification.module'
import { ConfigModule } from './shared/config/config.module'
import { TelegramModule } from './telegram/telegram.module'

@Module({
	imports: [
		ConfigModule,
		TelegramModule,
		NotificationModule,
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				uri: config.get('MONGO_URI'),
			}),
		}),
		ScheduleModule.forRoot(),
	],
})
export class AppModule {}
