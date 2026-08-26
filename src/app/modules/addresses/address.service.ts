import { prisma } from "@/app/lib/prisma";
import { IAddress } from "./address.interface";
import { AppError } from "@/app/errors/AppError";

const createAddress = async (userId: string, payload: IAddress) => {
  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, isDeleted: false },
      data: { isDefault: false },
    });
  } else {
    const existingAddress = await prisma.address.findFirst({
      where: { userId, isDeleted: false },
    });
    if (!existingAddress) {
      payload.isDefault = true;
    }
  }

  const result = await prisma.address.create({
    data: {
      userId,
      ...payload,
    },
  });
  return result;
};

const getMyAddresses = async (userId: string) => {
  const result = await prisma.address.findMany({
    where: { userId, isDeleted: false },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" }
    ]
  });
  return result;
};

const getAddressById = async (userId: string, id: string) => {
  const result = await prisma.address.findUnique({
    where: { id, userId, isDeleted: false },
  });
  if (!result) {
    throw new AppError(404, "Address not found");
  }
  return result;
};

const updateAddress = async (userId: string, id: string, payload: Partial<IAddress>) => {
  const address = await prisma.address.findUnique({
    where: { id, userId, isDeleted: false },
  });
  
  if (!address) {
    throw new AppError(404, "Address not found");
  }

  if (payload.isDefault) {
    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, isDefault: true, isDeleted: false },
        data: { isDefault: false },
      });
      await tx.address.update({
        where: { id },
        data: payload,
      });
    });
    
    return await prisma.address.findUnique({ where: { id } });
  }

  const result = await prisma.address.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteAddress = async (userId: string, id: string) => {
  const address = await prisma.address.findUnique({
    where: { id, userId, isDeleted: false },
  });
  
  if (!address) {
    throw new AppError(404, "Address not found");
  }

  const result = await prisma.address.update({
    where: { id },
    data: { isDeleted: true, isDefault: false },
  });
  
  if (address.isDefault) {
     const anotherAddress = await prisma.address.findFirst({
         where: { userId, isDeleted: false }
     });
     if (anotherAddress) {
         await prisma.address.update({
             where: { id: anotherAddress.id },
             data: { isDefault: true }
         });
     }
  }
  
  return result;
};

const setDefaultAddress = async (userId: string, id: string) => {
  const address = await prisma.address.findUnique({
    where: { id, userId, isDeleted: false },
  });
  
  if (!address) {
    throw new AppError(404, "Address not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isDefault: true, isDeleted: false },
      data: { isDefault: false },
    });
    
    await tx.address.update({
      where: { id },
      data: { isDefault: true },
    });
  });

  return await prisma.address.findUnique({ where: { id } });
};

export const AddressService = {
  createAddress,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
