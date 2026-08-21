import {Router} from 'express';

import * as userController from './user.controller';

import { validateRequest } from '@/app/middleware/validateRequest';

import { registerUserSchema, loginUserSchema } from './user.validation';

const router = Router();


router.post("/register", validateRequest(registerUserSchema), userController.registerUser);
router.post("/login", validateRequest(loginUserSchema), userController.loginUser);
router.post("/logout", userController.logout);
// router.get("/all", userController.getAllUser);
// router.get("/single/:id", userController.getSingleUser);
// router.patch("/single/:id", validateRequest(registerUserSchema), userController.updateSingleUser);
// router.delete("/single/:id", userController.deleteSingleUser);


export default router;