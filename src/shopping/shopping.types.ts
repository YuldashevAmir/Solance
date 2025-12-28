export interface IShoppingItem {
	message: string
	bought: boolean
}

export interface IShopping {
	completed: boolean
	validTo: Date
	items: IShoppingItem[]
	chatId: string
}

