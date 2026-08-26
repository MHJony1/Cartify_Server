export interface ICreateProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  categoryId: string;
}

export interface IUpdateProduct {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image?: string;
  categoryId?: string;
}


export interface IProductQuery {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}