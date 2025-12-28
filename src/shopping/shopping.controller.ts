import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'
import { ShoppingService } from './shopping.service'
import { IShopping } from './shopping.types'

@Controller('shopping')
export class ShoppingController {
	constructor(private readonly shoppingService: ShoppingService) {}

	@Get(':chatId')
	async getShoppingList(
		@Param('chatId') chatId: string
	): Promise<IShopping | null> {
		return this.shoppingService.getShoppingList(chatId)
	}

	@Post(':chatId/item')
	async markItemAsBought(
		@Param('chatId') chatId: string,
		@Body() body: { itemMessage: string }
	): Promise<IShopping | null> {
		return this.shoppingService.markItemAsBought(
			chatId,
			body.itemMessage
		)
	}
}

