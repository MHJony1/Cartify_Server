import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { OrderStatus, UserRole } from "@/generated/prisma/enums";
import { ICreateReview, IReviewQuery, IUpdateReview } from "./review.interface";

// ==============================
// Create Review
// ==============================
const createReview = async (userId: string, payload: ICreateReview) => {
  const { productId, rating, comment } = payload;

  // 1. Check if product exists and is not deleted
  const product = await prisma.product.findUnique({
    where: { id: productId, isDeleted: false },
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  // 2. Check if user already reviewed
  const existingReview = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existingReview) {
    if (!existingReview.isDeleted) {
      throw new AppError(400, "You have already reviewed this product");
    }
  }

  // 3. Check if user has a DELIVERED order with this product
  const hasDeliveredOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: OrderStatus.DELIVERED,
      isDeleted: false,
      items: {
        some: {
          productId,
          isDeleted: false,
        },
      },
    },
  });

  if (!hasDeliveredOrder) {
    throw new AppError(
      403,
      "You can only review a product after purchasing and receiving it"
    );
  }

  // 4. Create or update review
  if (existingReview && existingReview.isDeleted) {
    return await prisma.review.update({
      where: { id: existingReview.id },
      data: { rating, comment, isDeleted: false },
    });
  }

  return await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
    },
  });
};

// ==============================
// Get Product Reviews
// ==============================
const getProductReviews = async (productId: string, query: IReviewQuery) => {
  const {
    page = 1,
    limit = 10,
    rating,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  let pageNumber = Number(page);
  let limitNumber = Number(limit);

  if (pageNumber < 1 || isNaN(pageNumber)) pageNumber = 1;
  if (limitNumber < 1 || isNaN(limitNumber)) limitNumber = 10;
  if (limitNumber > 100) limitNumber = 100;

  const allowedSortFields = ["createdAt", "updatedAt", "rating"];
  const validSortBy = allowedSortFields.includes(sortBy as string)
    ? (sortBy as string)
    : "createdAt";
  const validSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const skip = (pageNumber - 1) * limitNumber;

  const where: any = {
    productId,
    isDeleted: false,
  };

  if (rating) {
    const ratingNumber = Number(rating);
    if (!isNaN(ratingNumber)) {
      where.rating = ratingNumber;
    }
  }

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    skip,
    take: limitNumber,
    orderBy: {
      [validSortBy]: validSortOrder,
    },
  });

  const total = await prisma.review.count({ where });
  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: reviews,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    },
  };
};

// ==============================
// Get My Reviews
// ==============================
const getMyReviews = async (userId: string) => {
  const reviews = await prisma.review.findMany({
    where: { userId, isDeleted: false },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

// ==============================
// Update Review
// ==============================
const updateReview = async (
  userId: string,
  reviewId: string,
  payload: IUpdateReview
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId, isDeleted: false },
  });

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  if (review.userId !== userId) {
    throw new AppError(403, "You do not have permission to update this review");
  }

  const { rating, comment } = payload;

  return await prisma.review.update({
    where: { id: reviewId },
    data: { rating, comment },
  });
};

// ==============================
// Delete Review (Soft Delete)
// ==============================
const deleteReview = async (
  userId: string,
  role: string,
  reviewId: string
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId, isDeleted: false },
  });

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  if (role !== UserRole.ADMIN && review.userId !== userId) {
    throw new AppError(403, "You do not have permission to delete this review");
  }

  return await prisma.review.update({
    where: { id: reviewId },
    data: { isDeleted: true },
  });
};

// ==============================
// Get All Reviews (Admin)
// ==============================
const getAllReviews = async (query: IReviewQuery) => {
  const {
    page = 1,
    limit = 10,
    productId,
    rating,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  let pageNumber = Number(page);
  let limitNumber = Number(limit);

  if (pageNumber < 1 || isNaN(pageNumber)) pageNumber = 1;
  if (limitNumber < 1 || isNaN(limitNumber)) limitNumber = 10;
  if (limitNumber > 100) limitNumber = 100;

  const allowedSortFields = ["createdAt", "updatedAt", "rating"];
  const validSortBy = allowedSortFields.includes(sortBy as string)
    ? (sortBy as string)
    : "createdAt";
  const validSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const skip = (pageNumber - 1) * limitNumber;

  const where: any = {
    isDeleted: false,
  };

  if (productId) {
    where.productId = productId;
  }

  if (rating) {
    const ratingNumber = Number(rating);
    if (!isNaN(ratingNumber)) {
      where.rating = ratingNumber;
    }
  }

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    skip,
    take: limitNumber,
    orderBy: {
      [validSortBy]: validSortOrder,
    },
  });

  const total = await prisma.review.count({ where });
  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: reviews,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    },
  };
};

export const reviewService = {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
};

// Trigger TS server refresh
