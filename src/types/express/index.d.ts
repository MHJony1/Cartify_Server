import { Role } from "../../../generated/prisma/client";


declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        role: Role;
        status?: string;
      };
    }
  }
}

