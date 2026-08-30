export interface IAddToCart {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface IUpdateCartItem {
  quantity: number;
}
