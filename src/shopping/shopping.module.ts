import { Module } from '@nestjs/common'

import { aiClientService } from 'src/shared/apiClient/aiClient'
import { TodoistClient } from 'src/shared/apiClient/todoistClient'
import { ConfigModule } from 'src/shared/config/config.module'
import { ShoppingService } from './shopping.service'

@Module({
	imports: [ConfigModule],
	providers: [ShoppingService, aiClientService, TodoistClient],
	exports: [ShoppingService],
})
export class ShoppingModule {}
