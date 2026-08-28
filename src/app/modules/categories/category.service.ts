import { prisma } from "../../lib/prisma";
import type {
  ICreateCategory,
  IUpdateCategory,
} from "./category.interface";

//create a new category
export const createCategory = async (payload: ICreateCategory) => {
  const category = await prisma.category.create({
    data: payload,
  });

  return category;
};

//get all categories
export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    where: { isDeleted: false },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return categories;
};

//get a category by id
export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findFirst({
    where: { id, isDeleted: false },
    include: { _count: { select: { products: true } } },
  });

  if (!category) throw new Error("Category Not Found");

  return category;
};

//update a category
export const updateCategory = async (
  id: string,
  payload: IUpdateCategory
) => {
  const existingCategory = await prisma.category.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existingCategory) throw new Error("Category Not Found");

  const category = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return category;
};

//delete a category
export const deleteCategory = async (id: string) => {
  const existingCategory = await prisma.category.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existingCategory) throw new Error("Category Not Found");

  const category = await prisma.category.update({
    where: { id },
    data: { isDeleted: true },
  });

  return category;
};