import { Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { aiClientService } from './aiClient.service'

@Module({
	imports: [ConfigModule],
	providers: [aiClientService],
	exports: [aiClientService],
})
export class AIClientModule {}
