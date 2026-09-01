import {Router} from 'express';

import * as userController from './user.controller';

import { validateRequest } from '@/app/middleware/validateRequest';

import { registerUserSchema, loginUserSchema, updateUserSchema } from './user.validation';

const router = Router();

import { auth } from '@/app/middleware/auth';

router.post("/register", validateRequest(registerUserSchema), userController.registerUser);
router.post("/login", validateRequest(loginUserSchema), userController.loginUser);
router.post("/google", userController.googleLoginUser);
router.post("/logout", userController.logout);
router.get("/me", auth, userController.getMe);

// router.get("/all", userController.getAllUser);
// router.get("/single/:id", userController.getSingleUser);
router.patch("/:id", auth, validateRequest(updateUserSchema), userController.updateSingleUser);
// router.delete("/single/:id", userController.deleteSingleUser);

// Admin Routes
import { authorize } from '@/app/middleware/role';
import { UserRole } from '@/generated/prisma/enums';

router.get("/admin", auth, authorize(UserRole.ADMIN), userController.adminGetAllUsers);
router.get("/admin/:id", auth, authorize(UserRole.ADMIN), userController.adminGetSingleUser);
router.patch("/admin/:id/status", auth, authorize(UserRole.ADMIN), userController.adminUpdateUserStatus);
router.patch("/admin/:id/role", auth, authorize(UserRole.ADMIN), userController.adminUpdateUserRole);

export default router;