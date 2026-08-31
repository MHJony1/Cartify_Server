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
      phone: payload.phone,
      image: payload.image,
      password: hashedPassword,
      status: "ACTIVE",
    },
  });

  const token = createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
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

import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLoginUser = async (credential: string) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError(500, 'Google OAuth is not configured on the server.');
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError(401, 'Invalid Google token');
  }

  const { email, name, picture } = payload;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Create new user for Google login
    user = await prisma.user.create({
      data: {
        email,
        name: name || 'Google User',
        image: picture,
        // Generate a random password since they use Google
        password: await bcrypt.hash(Math.random().toString(36).slice(-12) + Date.now().toString(), 10),
        status: "ACTIVE",
      },
    });
  } else if (!user.image && picture) {
    // Optionally update picture if they didn't have one
    user = await prisma.user.update({
      where: { id: user.id },
      data: { image: picture },
    });
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
      image: user.image,
      role: user.role,
    },
  };
};

const selectWithoutPassword = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
};

export const getAllUser = async () => {
  const allUser = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
    select: selectWithoutPassword,
  });
  return allUser;
};

const getSingleUser = async (id: string) => {
  const singleUser = await prisma.user.findUnique({
    where: {
      id: id,
      isDeleted: false,
    },
    select: selectWithoutPassword,
  });
  return singleUser;
};

export const updateSingleUser = async (id: string, payload: IUpdateUser) => {
  const updateUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: payload,
    select: selectWithoutPassword,
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
    select: selectWithoutPassword,
  });
  if (!deleteUser) {
    throw new AppError(500, 'User Deletion Failed');
  }
  return deleteUser;
};
