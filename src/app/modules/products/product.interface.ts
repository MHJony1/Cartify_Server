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