import { Product } from './product';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: Product;
}

export interface WishlistResponse {
  items: WishlistItemWithProduct[];
  count: number;
}
