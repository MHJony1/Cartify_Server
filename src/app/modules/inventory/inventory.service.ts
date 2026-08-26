import { prisma } from "@/app/lib/prisma";
import { AppError } from "@/app/errors/AppError";
import { IAdjust, IDamage, IInventoryHistoryQuery, IInventoryQuery, IRestock } from "./inventory.interface";
import { InventoryTransactionType } from "@/generated/prisma/enums";

// A basic global configuration for low stock threshold
const LOW_STOCK_THRESHOLD = 5;

// ==============================
// Helper function to calculate stock status
// ==============================
const getStockStatus = (stock: number) => {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= LOW_STOCK_THRESHOLD) return "LOW_STOCK";
  return "IN_STOCK";
};

// ==============================
// Get All Inventory (Admin)
// ==============================
const getInventory = async (query: IInventoryQuery) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    stockStatus,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  let pageNumber = Number(page);
  let limitNumber = Number(limit);

  if (pageNumber < 1 || isNaN(pageNumber)) pageNumber = 1;
  if (limitNumber < 1 || isNaN(limitNumber)) limitNumber = 10;
  if (limitNumber > 100) limitNumber = 100;

  const allowedSortFields = ["stock", "name", "createdAt", "updatedAt"];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const validSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const skip = (pageNumber - 1) * limitNumber;

  const where: any = {
    isDeleted: false,
  };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (category) {
    where.category = {
      name: {
        contains: category,
        mode: "insensitive",
      },
    };
  }

  if (stockStatus) {
    if (stockStatus === "OUT_OF_STOCK") {
      where.stock = { lte: 0 };
    } else if (stockStatus === "LOW_STOCK") {
      where.stock = { gt: 0, lte: LOW_STOCK_THRESHOLD };
    } else if (stockStatus === "IN_STOCK") {
      where.stock = { gt: LOW_STOCK_THRESHOLD };
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
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

  const total = await prisma.product.count({ where });
  const totalPages = Math.ceil(total / limitNumber);

  // Map to inventory format
  const data = products.map(product => ({
    productId: product.id,
    productName: product.name,
    slug: product.slug,
    image: product.image,
    category: product.category,
    stock: product.stock,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    stockStatus: getStockStatus(product.stock),
  }));

  return {
    data,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    },
  };
};

// ==============================
// Get Inventory Details (Admin)
// ==============================
const getInventoryDetails = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId, isDeleted: false },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError(404, "Product not found or deleted");
  }

  return {
    productId: product.id,
    productName: product.name,
    slug: product.slug,
    image: product.image,
    category: product.category,
    stock: product.stock,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    stockStatus: getStockStatus(product.stock),
  };
};

// ==============================
// Get Inventory History (Admin)
// ==============================
const getInventoryHistory = async (productId: string, query: IInventoryHistoryQuery) => {
  const product = await prisma.product.findUnique({
    where: { id: productId, isDeleted: false },
  });

  if (!product) {
    throw new AppError(404, "Product not found or deleted");
  }

  const {
    page = 1,
    limit = 10,
    type,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  let pageNumber = Number(page);
  let limitNumber = Number(limit);

  if (pageNumber < 1 || isNaN(pageNumber)) pageNumber = 1;
  if (limitNumber < 1 || isNaN(limitNumber)) limitNumber = 10;
  if (limitNumber > 100) limitNumber = 100;

  const allowedSortFields = ["createdAt"];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const validSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const skip = (pageNumber - 1) * limitNumber;

  const where: any = {
    productId,
  };

  if (type) {
    where.type = type;
  }

  const transactions = await prisma.inventoryTransaction.findMany({
    where,
    skip,
    take: limitNumber,
    orderBy: {
      [validSortBy]: validSortOrder,
    },
  });

  const total = await prisma.inventoryTransaction.count({ where });
  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: transactions,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    },
  };
};

// ==============================
// Restock (Admin)
// ==============================
const restock = async (productId: string, payload: IRestock) => {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new AppError(404, "Product not found or deleted");
    }

    const previousStock = product.stock;
    const newStock = previousStock + payload.quantity;

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    await tx.inventoryTransaction.create({
      data: {
        productId,
        type: InventoryTransactionType.RESTOCK,
        quantity: payload.quantity,
        previousStock,
        newStock,
        note: payload.note,
      },
    });

    return updatedProduct;
  });
};

// ==============================
// Record Damage (Admin)
// ==============================
const damage = async (productId: string, payload: IDamage) => {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new AppError(404, "Product not found or deleted");
    }

    if (product.stock < payload.quantity) {
      throw new AppError(400, "Cannot record damage: quantity exceeds current stock");
    }

    const previousStock = product.stock;
    const newStock = previousStock - payload.quantity;

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    await tx.inventoryTransaction.create({
      data: {
        productId,
        type: InventoryTransactionType.DAMAGE,
        quantity: payload.quantity,
        previousStock,
        newStock,
        note: payload.note,
      },
    });

    return updatedProduct;
  });
};

// ==============================
// Manual Adjustment (Admin)
// ==============================
const adjust = async (productId: string, payload: IAdjust) => {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId, isDeleted: false },
    });

    if (!product) {
      throw new AppError(404, "Product not found or deleted");
    }

    const previousStock = product.stock;
    let newStock = previousStock;
    let diff = payload.quantity;

    if (payload.operation === "SET") {
      newStock = payload.quantity;
      diff = Math.abs(newStock - previousStock);
    } else if (payload.operation === "INCREASE") {
      newStock = previousStock + payload.quantity;
    } else if (payload.operation === "DECREASE") {
      newStock = previousStock - payload.quantity;
      if (newStock < 0) {
        throw new AppError(400, "Cannot decrease stock below zero");
      }
    }

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    await tx.inventoryTransaction.create({
      data: {
        productId,
        type: InventoryTransactionType.ADJUSTMENT,
        quantity: diff,
        previousStock,
        newStock,
        note: payload.note,
      },
    });

    return updatedProduct;
  });
};

export const InventoryService = {
  getInventory,
  getInventoryDetails,
  getInventoryHistory,
  restock,
  damage,
  adjust,
};
