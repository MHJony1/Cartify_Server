import { UserRole } from '@/generated/prisma/enums';

export interface ICreateUser {
  name: string;
  email: string;
  password: string;
}

export interface IUpdateUser {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IJwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
