import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

import {
  ICreateProduct,
  IUpdateProduct,
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



export const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
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