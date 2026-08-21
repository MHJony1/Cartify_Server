import bcrypt from 'bcryptjs';

import { prisma } from '../../lib/prisma';

import { AppError } from '@/app/errors/AppError';

import {
  ICreateUser,
  IUpdateUser,
  ILoginUser,
} from './user.interface';
import { createToken } from '@/app/utils/jwt';

export const registerUser = async (payload: ICreateUser) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new AppError(409, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const loginUser = async (payload: ILoginUser) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};

export const getAllUser = async () => {
  const allUser = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
  });
  return allUser;
};

const getSingleUser = async (id: string) => {
  const singleUser = await prisma.user.findUnique({
    where: {
      id: id,
      isDeleted: false,
    },
  });
  return singleUser;
};

const updateSignleUser = async (id: string, payload: IUpdateUser) => {
  const updateUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: payload,
  });
  if (!updateUser) {
    throw new AppError(500, 'User Update Failed');
  }
  return updateUser;
};

const deleteSingleUser = async (id: string) => {
  const deleteUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
  if (!deleteUser) {
    throw new AppError(500, 'User Deletion Failed');
  }
  return deleteUser;
};
