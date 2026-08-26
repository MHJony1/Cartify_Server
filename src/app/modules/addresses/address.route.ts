import { Router } from "express";
import * as addressController from "./address.controller";
import { auth } from "@/app/middleware/auth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { AddressValidation } from "./address.validation";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(AddressValidation.createAddressSchema),
  addressController.createAddress
);

router.get(
  "/",
  auth,
  addressController.getMyAddresses
);

router.get(
  "/:id",
  auth,
  addressController.getAddressById
);

router.patch(
  "/:id",
  auth,
  validateRequest(AddressValidation.updateAddressSchema),
  addressController.updateAddress
);

router.delete(
  "/:id",
  auth,
  addressController.deleteAddress
);

router.patch(
  "/:id/default",
  auth,
  addressController.setDefaultAddress
);

export const addressRoutes = router;
