import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AIClientModule } from '../shared/apiClient/aiClient.module'
import { ConfigModule } from '../shared/config/config.module'
import { ShoppingSchema } from './shopping.schema'
import { ShoppingService } from './shopping.service'
import { ShoppingController } from './shopping.controller'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Shopping', schema: ShoppingSchema },
		]),
		ConfigModule,
		AIClientModule,
	],
	providers: [ShoppingService],
	exports: [ShoppingService],
	controllers: [ShoppingController],
})
export class ShoppingModule {}

