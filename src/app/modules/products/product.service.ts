import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

import {
  ICreateProduct,
  IUpdateProduct,
  IProductQuery,
} from "./product.interface";




export const createProduct = async (
  payload: ICreateProduct
) => {
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new AppError(
      404,
      "Category not found"
    );
  }

  const product = await prisma.product.create({
    data: {
      ...payload,
      slug: payload.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    },
    include: {
      category: true,
    },
  });

  return product;
};

export const createManyProducts = async (
  payload: ICreateProduct[]
) => {
  const result = await prisma.$transaction(
    payload.map((data) =>
      prisma.product.create({
        data: {
          ...data,
          slug: data.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        },
        include: {
          category: true,
        },
      })
    )
  );

  return result;
};

export const getProducts = async (
  query: IProductQuery
) => {
  const {
    search,
    categoryId,
    minPrice,
    maxPrice,
    inStock,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const minPriceNumber =
    minPrice !== undefined
      ? Number(minPrice)
      : undefined;

  const maxPriceNumber =
    maxPrice !== undefined
      ? Number(maxPrice)
      : undefined;

  const inStockBoolean =
    inStock === undefined
      ? undefined
      : inStock === true;

  const skip =
    (pageNumber - 1) * limitNumber;

  const where: any = {};

  // Search
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Price filter
  if (
    minPriceNumber !== undefined ||
    maxPriceNumber !== undefined
  ) {
    where.price = {};

    if (minPriceNumber !== undefined) {
      where.price.gte = minPriceNumber;
    }

    if (maxPriceNumber !== undefined) {
      where.price.lte = maxPriceNumber;
    }
  }

  // Stock filter
  if (inStockBoolean !== undefined) {
    if (inStockBoolean) {
      where.stock = {
        gt: 0,
      };
    } else {
      where.stock = 0;
    }
  }

  // Sorting
  const orderBy = {
    [sortBy]: sortOrder,
  };

  const products =
    await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      skip,
      take: limitNumber,
      orderBy,
    });

  const total =
    await prisma.product.count({
      where,
    });

  return {
    data: products,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};



export const getProductById = async (
  id: string
) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new AppError(
      404,
      "Product not found"
    );
  }

  return product;
};




export const updateProduct = async (
  id: string,
  payload: IUpdateProduct
) => {
  const existingProduct =
    await prisma.product.findUnique({
      where: {
        id,
      },
    });

  if (!existingProduct) {
    throw new AppError(
      404,
      "Product not found"
    );
  }

  if (payload.categoryId) {
    const category =
      await prisma.category.findUnique({
        where: {
          id: payload.categoryId,
        },
      });

    if (!category) {
      throw new AppError(
        404,
        "Category not found"
      );
    }
  }

  const product = await prisma.product.update({
    where: {
      id,
    },
    data: payload,
    include: {
      category: true,
    },
  });

  return product;
};

export const deleteProduct = async (
  id: string
) => {
  const existingProduct =
    await prisma.product.findUnique({
      where: {
        id,
      },
    });

  if (!existingProduct) {
    throw new AppError(
      404,
      "Product not found"
    );
  }

  const product =
    await prisma.product.delete({
      where: {
        id,
      },
    });

  return product;
};