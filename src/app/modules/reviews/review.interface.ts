export interface ICreateReview {
  productId: string;
  rating: number;
  comment?: string;
}

export interface IUpdateReview {
  rating?: number;
  comment?: string;
}

export interface IReviewQuery {
  page?: number;
  limit?: number;
  productId?: string;
  rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
