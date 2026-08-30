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

  const { variants, images, ...productData } = payload;

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug: productData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      variants: {
        create: variants,
      },
      images: images ? {
        create: images,
      } : undefined,
    },
    include: {
      category: true,
      variants: true,
      images: true,
    },
  });

  return product;
};

export const createManyProducts = async (
  payload: ICreateProduct[]
) => {
  const result = await prisma.$transaction(
    payload.map((data) => {
      const { variants, images, ...productData } = data;
      return prisma.product.create({
        data: {
          ...productData,
          slug: productData.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          variants: {
            create: variants,
          },
          images: images ? {
            create: images,
          } : undefined,
        },
        include: {
          category: true,
          variants: true,
          images: true,
        },
      });
    })
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

  let pageNumber = Number(page);
  let limitNumber = Number(limit);

  if (pageNumber < 1 || isNaN(pageNumber)) pageNumber = 1;
  if (limitNumber < 1 || isNaN(limitNumber)) limitNumber = 10;
  if (limitNumber > 100) limitNumber = 100;

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

  // Stock filter (now based on variants)
  if (inStockBoolean !== undefined) {
    if (inStockBoolean) {
      where.variants = {
        some: {
          stock: { gt: 0 }
        }
      };
    } else {
      where.variants = {
        every: {
          stock: 0
        }
      };
    }
  }

  // New Filters
  if (query.gender) where.gender = query.gender;
  if (query.collection) where.collection = query.collection;
  
  if (query.size || query.color) {
    where.variants = {
      ...(where.variants || {}),
      some: {
        ...(where.variants?.some || {}),
      }
    };
    if (query.size) where.variants.some.size = query.size;
    if (query.color) where.variants.some.color = query.color;
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
        variants: true,
        images: true,
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
      variants: true,
      images: true,
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

  const { variants, images, ...updateData } = payload;

  const product = await prisma.product.update({
    where: {
      id,
    },
    data: updateData,
    include: {
      category: true,
      variants: true,
      images: true,
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
    await prisma.product.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

  return product;
};