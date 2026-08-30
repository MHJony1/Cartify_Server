export interface IRestock {
  variantId: string;
  quantity: number;
  note?: string;
}

export interface IDamage {
  variantId: string;
  quantity: number;
  note?: string;
}

export interface IAdjust {
  variantId: string;
  operation: "INCREASE" | "DECREASE" | "SET";
  quantity: number;
  note?: string;
}

export interface IInventoryQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IInventoryHistoryQuery {
  variantId?: string;
  page?: number | string;
  limit?: number | string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
