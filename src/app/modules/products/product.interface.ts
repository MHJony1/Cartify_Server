export interface IProductVariant {
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
  compareAtPrice?: number;
}

export interface IProductImage {
  url: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ICreateProduct {
  name: string;
  description?: string;
  price: number;
  gender?: "MEN" | "WOMEN" | "KIDS" | "UNISEX";
  material?: string;
  brand?: string;
  collection?: string;
  categoryId: string;
  variants: IProductVariant[];
  images?: IProductImage[];
}

export interface IUpdateProduct {
  name?: string;
  description?: string;
  price?: number;
  gender?: "MEN" | "WOMEN" | "KIDS" | "UNISEX";
  material?: string;
  brand?: string;
  collection?: string;
  categoryId?: string;
  variants?: IProductVariant[];
  images?: IProductImage[];
}

export interface IProductQuery {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  gender?: "MEN" | "WOMEN" | "KIDS" | "UNISEX";
  size?: string;
  color?: string;
  collection?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}